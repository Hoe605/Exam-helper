export interface SSEMessage {
  event: string;
  data: unknown;
  id?: string;
  retry?: number;
}

export type SSEHandler = (data: unknown, message: SSEMessage) => void | Promise<void>;

export interface SSEHandlers {
  [eventName: string]: SSEHandler | undefined;
}

function parseSSEBlock(block: string): SSEMessage | null {
  const lines = block.split(/\r?\n/);
  const dataLines: string[] = [];
  let event = 'message';
  let id: string | undefined;
  let retry: number | undefined;

  for (const line of lines) {
    if (!line || line.startsWith(':')) continue;

    const separatorIndex = line.indexOf(':');
    const field = separatorIndex === -1 ? line : line.slice(0, separatorIndex);
    const rawValue = separatorIndex === -1 ? '' : line.slice(separatorIndex + 1);
    const value = rawValue.startsWith(' ') ? rawValue.slice(1) : rawValue;

    if (field === 'event') event = value;
    if (field === 'data') dataLines.push(value);
    if (field === 'id') id = value;
    if (field === 'retry') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) retry = parsed;
    }
  }

  if (!dataLines.length && event === 'message' && id === undefined && retry === undefined) {
    return null;
  }

  const rawData = dataLines.join('\n');
  let data: unknown = rawData;

  if (rawData) {
    try {
      data = JSON.parse(rawData);
    } catch {
      data = rawData;
    }
  } else {
    data = null;
  }

  return { event, data, id, retry };
}

async function dispatchMessage(message: SSEMessage, handlers: SSEHandlers) {
  const handler = handlers[message.event] ?? handlers.message;
  if (handler) {
    await handler(message.data, message);
  }
}

export async function consumeSSE(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  handlers: SSEHandlers
) {
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split(/\r?\n\r?\n/);
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      const message = parseSSEBlock(part);
      if (!message) continue;

      await dispatchMessage(message, handlers);
      if (message.event === 'done') return;
    }
  }

  const tail = buffer.trim();
  if (tail) {
    const message = parseSSEBlock(tail);
    if (message) {
      await dispatchMessage(message, handlers);
    }
  }
}
