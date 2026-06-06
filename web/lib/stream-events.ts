export const STREAM_EVENTS = {
  progress: 'progress',
  token: 'token',
  reviewRequired: 'review_required',
  error: 'error',
  done: 'done',
  message: 'message',
} as const;

export type KnownStreamEventName = typeof STREAM_EVENTS[keyof typeof STREAM_EVENTS];
export type StreamEventName = KnownStreamEventName | (string & {});

export interface StreamRunMetadata {
  run_id?: string;
  seq?: number;
  outline_id?: number;
  node_id?: number;
  [key: string]: unknown;
}

export interface StreamErrorPayload extends StreamRunMetadata {
  message?: string;
  code?: string;
  recoverable?: boolean;
  details?: Record<string, unknown>;
}

export interface StreamDonePayload extends StreamRunMetadata {
  ok?: boolean;
}

export interface TokenStreamPayload extends StreamRunMetadata {
  content?: string;
  message?: string;
}

export interface ProgressStreamPayload extends StreamRunMetadata {
  step?: string;
  count?: number;
  current?: number;
  total?: number;
  total_chunks?: number;
  processed_chunks?: number;
  db_response?: string;
  errors?: string[];
  message?: string;
}

export interface OutlineReviewTask {
  task_description?: string;
  start_anchor?: string;
  end_anchor?: string;
  [key: string]: unknown;
}

export interface OutlineReviewRequiredPayload extends ProgressStreamPayload {
  is_awaiting_review?: boolean;
  outline_id?: number;
  plan?: OutlineReviewTask[];
  node_count?: number;
  tasks?: Record<string, string>;
  snapshot?: {
    outline_id?: number;
    [key: string]: unknown;
  };
}

export interface StreamEventPayloadMap {
  [STREAM_EVENTS.progress]: ProgressStreamPayload;
  [STREAM_EVENTS.token]: TokenStreamPayload;
  [STREAM_EVENTS.reviewRequired]: OutlineReviewRequiredPayload;
  [STREAM_EVENTS.error]: StreamErrorPayload;
  [STREAM_EVENTS.done]: StreamDonePayload;
  [STREAM_EVENTS.message]: unknown;
}

export type StreamPayloadFor<EventName extends StreamEventName> =
  EventName extends keyof StreamEventPayloadMap ? StreamEventPayloadMap[EventName] : unknown;

export function isObjectPayload(data: unknown): data is Record<string, unknown> {
  return typeof data === 'object' && data !== null;
}

export function isStreamErrorPayload(data: unknown): data is StreamErrorPayload {
  return isObjectPayload(data);
}

export function isTokenStreamPayload(data: unknown): data is TokenStreamPayload {
  return isObjectPayload(data);
}

export function isProgressStreamPayload(data: unknown): data is ProgressStreamPayload {
  return isObjectPayload(data);
}

export function isOutlineReviewRequiredPayload(data: unknown): data is OutlineReviewRequiredPayload {
  return isObjectPayload(data);
}
