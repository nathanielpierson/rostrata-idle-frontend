import { apiRequest } from './client';
import type { Fish } from '../types/fish';
import { getStoredAuth } from './auth';
import type { StorageDelta } from './trees';

export type FetchFishResult = {
  fish: Fish[];
  error: string | null;
};

export async function fetchFish(): Promise<FetchFishResult> {
  const { data, ok, error } = await apiRequest<Fish[]>('/fish');
  if (!ok) {
    return {
      fish: [],
      error: error ?? 'Could not load fish. Is the backend running?',
    };
  }
  if (!Array.isArray(data)) {
    return { fish: [], error: 'Unexpected response from server.' };
  }
  return { fish: data, error: null };
}

export interface CatchFishResult {
  userId: number;
  fishId: number;
  xpGranted: number;
  fishingXpTotal: number;
  storageDeltas?: StorageDelta[];
}

export async function catchFish(
  fishId: number,
): Promise<{ result?: CatchFishResult; error?: string }> {
  const auth = getStoredAuth();
  if (!auth) {
    return { error: 'You must be logged in to train skills.' };
  }
  const { data, ok, status, error } = await apiRequest<CatchFishResult>(
    `/fish/${fishId}/catch`,
    {
      method: 'POST',
      username: auth.username,
      password: auth.password,
    },
  );
  if (ok && data) {
    return { result: data };
  }
  if (status === 401) {
    return { error: 'Your session expired. Please log in again.' };
  }
  return { error: error ?? 'Could not save fishing XP.' };
}
