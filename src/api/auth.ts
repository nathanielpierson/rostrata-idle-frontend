import { apiRequest } from './client';
import type { User } from '../types/auth';

const AUTH_ME_KEY = 'rostrata_auth_me';

export interface StoredAuth {
  username: string;
  password: string;
}

export function getStoredAuth(): StoredAuth | null {
  try {
    const raw = sessionStorage.getItem(AUTH_ME_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function setStoredAuth(username: string, password: string): void {
  sessionStorage.setItem(AUTH_ME_KEY, JSON.stringify({ username, password }));
}

export function clearStoredAuth(): void {
  sessionStorage.removeItem(AUTH_ME_KEY);
}

/** Login: validate credentials by calling GET /api/auth/me with Basic auth; returns user or error. */
export async function login(username: string, password: string): Promise<{ user?: User; error?: string }> {
  const { data, ok, status, error } = await apiRequest<User>('/api/auth/me', {
    username,
    password,
  });
  if (ok && data) {
    setStoredAuth(username, password);
    return { user: data };
  }
  if (status === 401) {
    return { error: 'Invalid username or password.' };
  }
  return { error: error ?? 'Login failed.' };
}

/** Logout: clear stored credentials (no backend call). */
export function logout(): void {
  clearStoredAuth();
}

/** Sign up: POST /api/auth/register; on success returns user (and optionally log them in). */
export async function signup(
  email: string,
  username: string,
  password: string
): Promise<{ user?: User; error?: string }> {
  const { data, ok, error } = await apiRequest<User>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, username, password }),
  });
  if (ok && data) {
    setStoredAuth(username, password);
    return { user: data };
  }
  // Backend may return plain text error message for 400
  return { error: error ?? 'Sign up failed.' };
}

/** Fetch current user using stored credentials (e.g. on app load). */
export async function fetchCurrentUser(): Promise<User | null> {
  const stored = getStoredAuth();
  if (!stored) return null;
  const { data, ok } = await apiRequest<User>('/api/auth/me', {
    username: stored.username,
    password: stored.password,
  });
  if (ok && data) return data;
  clearStoredAuth();
  return null;
}
