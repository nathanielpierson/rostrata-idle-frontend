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
    ...headers,
  };
  // Only send JSON content type when there is a body. POST with
  // Content-Type: application/json and an empty body can cause Spring to return
  // 400 (e.g. "Required request body is missing") for some endpoints.
  if (body !== undefined && body !== '') {
    requestHeaders['Content-Type'] = 'application/json';
  }
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
      : (() => {
          if (typeof data === 'object' && data !== null) {
            const d = data as { message?: string; error?: string; path?: string };
            if (d.message) return d.message;
            if (d.error && d.path) return `${d.error} (${d.path})`;
          }
          return text || res.statusText;
        })();
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
