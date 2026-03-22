const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export function getAuthHeader(username: string, password: string): string {
  const encoded = btoa(`${username}:${password}`);
  return `Basic ${encoded}`;
}

export interface RequestOptions {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
  username?: string;
  password?: string;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<{ data?: T; status: number; ok: boolean; error?: string }> {
  const { method = 'GET', body, headers = {}, username, password } = options;
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };
  if (username && password) {
    requestHeaders['Authorization'] = getAuthHeader(username, password);
  }
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: requestHeaders,
      body,
      credentials: 'include',
    });
    let data: T | undefined;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text) as T;
      } catch {
        // non-JSON response
      }
    }
    const errorMessage = res.ok
      ? undefined
      : (data as { message?: string } | undefined)?.message ?? (text || res.statusText);
    return {
      data,
      status: res.status,
      ok: res.ok,
      error: errorMessage,
    };
  } catch (err) {
    return {
      status: 0,
      ok: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}
