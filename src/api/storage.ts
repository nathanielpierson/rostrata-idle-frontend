import { apiRequest } from './client';
import { getStoredAuth } from './auth';
import type { StorageItem } from '../types/storage';

export async function fetchStorage(): Promise<{ items: StorageItem[]; error: string | null }> {
  const auth = getStoredAuth();
  if (!auth) {
    return { items: [], error: 'Log in to view storage.' };
  }

  const { data, ok, error } = await apiRequest<StorageItem[]>('/storage', {
    username: auth.username,
    password: auth.password,
  });

  if (!ok) {
    return {
      items: [],
      error: error ?? 'Could not load storage. Is the backend running?',
    };
  }

  if (!Array.isArray(data)) {
    return { items: [], error: 'Unexpected response from server.' };
  }

  return { items: data, error: null };
}

