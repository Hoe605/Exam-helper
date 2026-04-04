const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

export const apiClient = {
  async get<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      method: 'GET',
    });
    return handleResponse(response);
  },

  async post<T>(path: string, body: any, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  async put<T>(path: string, body: any, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  async delete<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // Special method for streaming requests like outlines/extract or practice generation
  async fetchStream(path: string, body: any = null, options?: RequestInit): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    const method = options?.method || (body ? 'POST' : 'GET');
    
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      method,
      headers: {
        ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
        ...options?.headers,
      },
      body: method === 'POST' ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok || !response.body) {
      throw new Error(`Failed to initialize stream (Status: ${response.status})`);
    }
    
    return response.body.getReader();
  }
};

