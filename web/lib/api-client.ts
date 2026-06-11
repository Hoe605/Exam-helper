const BASE_URL = typeof window === 'undefined'
  ? (process.env.BACKEND_URL || 'http://localhost:8000') // 服务端：调用后端物理地址
  : (process.env.NEXT_PUBLIC_API_URL || '/api');       // 浏览器侧：默认走 /api 代理

export interface ApiErrorPayload {
  message: string;
  code?: string;
  recoverable?: boolean;
  details?: Record<string, unknown>;
}

export class ApiError extends Error {
  code?: string;
  recoverable?: boolean;
  details?: Record<string, unknown>;
  status: number;

  constructor(payload: ApiErrorPayload, status: number) {
    super(payload.message);
    this.name = 'ApiError';
    this.code = payload.code;
    this.recoverable = payload.recoverable;
    this.details = payload.details;
    this.status = status;
  }
}

function isErrorPayload(data: unknown): data is ApiErrorPayload {
  return typeof data === 'object' && data !== null && typeof (data as { message?: unknown }).message === 'string';
}

function normalizeErrorPayload(data: unknown, fallback: string): ApiErrorPayload {
  if (isErrorPayload(data)) return data;
  if (
    typeof data === 'object' &&
    data !== null &&
    isErrorPayload((data as { detail?: unknown }).detail)
  ) {
    return (data as { detail: ApiErrorPayload }).detail;
  }
  if (typeof data === 'object' && data !== null) {
    const detail = (data as { detail?: unknown }).detail;
    if (typeof detail === 'string') return { message: detail };
  }
  return { message: fallback };
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    if (response.status === 401) {
       // 同时清除 token 和 Zustand 持久化状态，避免登录态不一致
       if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('auth-storage');
       }
    }
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(normalizeErrorPayload(error, `HTTP error! Status: ${response.status}`), response.status);
  }
  // 204 No Content 等无响应体的状态码，直接返回 null
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export const apiClient = {
  async get<T>(path: string, options?: RequestInit): Promise<T> {
    const cleanPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
    const response = await fetch(`${BASE_URL}${cleanPath}`, {
      ...options,
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        ...options?.headers,
      },
    });
    return handleResponse(response);
  },

  async post<T>(path: string, body: unknown, options?: RequestInit): Promise<T> {
    const cleanPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
    const response = await fetch(`${BASE_URL}${cleanPath}`, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  async postForm<T>(path: string, formData: URLSearchParams, options?: RequestInit): Promise<T> {
    const cleanPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
    const response = await fetch(`${BASE_URL}${cleanPath}`, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...getAuthHeaders(),
        ...options?.headers,
      },
      body: formData.toString(),
    });
    return handleResponse(response);
  },

  async put<T>(path: string, body: unknown, options?: RequestInit): Promise<T> {
    const cleanPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
    const response = await fetch(`${BASE_URL}${cleanPath}`, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  async patch<T>(path: string, body: unknown, options?: RequestInit): Promise<T> {
    const cleanPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
    const response = await fetch(`${BASE_URL}${cleanPath}`, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  async delete<T>(path: string, options?: RequestInit): Promise<T> {
    const cleanPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
    const response = await fetch(`${BASE_URL}${cleanPath}`, {
      ...options,
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
        ...options?.headers,
      },
    });
    return handleResponse(response);
  },

  // Special method for streaming requests like outlines/extract or practice generation
  async fetchStream(path: string, body: unknown = null, options?: RequestInit): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    const cleanPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
    const method = options?.method || (body ? 'POST' : 'GET');
    
    const response = await fetch(`${BASE_URL}${cleanPath}`, {
      ...options,
      method,
      headers: {
        ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
        ...getAuthHeaders(),
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
