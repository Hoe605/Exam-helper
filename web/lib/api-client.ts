const BASE_URL = typeof window === 'undefined'
  ? (process.env.BACKEND_URL || 'http://localhost:8000') // 服务端：调用后端物理地址
  : (process.env.NEXT_PUBLIC_API_URL || '/api');       // 浏览器侧：默认走 /api 代理

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    if (response.status === 401) {
       // Optional: Redirect to login or clear token
       if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
       }
    }
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP error! Status: ${response.status}`);
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

  async post<T>(path: string, body: any, options?: RequestInit): Promise<T> {
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

  async put<T>(path: string, body: any, options?: RequestInit): Promise<T> {
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

  async patch<T>(path: string, body: any, options?: RequestInit): Promise<T> {
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
  async fetchStream(path: string, body: any = null, options?: RequestInit): Promise<ReadableStreamDefaultReader<Uint8Array>> {
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

