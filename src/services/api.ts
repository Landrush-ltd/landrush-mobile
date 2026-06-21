const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.landrush.com';

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: Record<string, unknown>;
  token?: string;
}

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

async function request<T>({
  method,
  path,
  body,
  token,
}: RequestOptions): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: <T>(path: string, token?: string) =>
    request<T>({ method: 'GET', path, token }),

  post: <T>(path: string, body: Record<string, unknown>, token?: string) =>
    request<T>({ method: 'POST', path, body, token }),

  put: <T>(path: string, body: Record<string, unknown>, token?: string) =>
    request<T>({ method: 'PUT', path, body, token }),

  patch: <T>(path: string, body: Record<string, unknown>, token?: string) =>
    request<T>({ method: 'PATCH', path, body, token }),

  delete: <T>(path: string, token?: string) =>
    request<T>({ method: 'DELETE', path, token }),
};
