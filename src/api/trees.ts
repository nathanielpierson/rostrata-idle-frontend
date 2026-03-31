import { apiRequest } from './client';
import type { Tree } from '../types/tree';
import { getStoredAuth } from './auth';

export type FetchTreesResult = {
  trees: Tree[];
  /** Set when the request fails or the response is not a tree list */
  error: string | null;
};

/**
 * Loads trees from rostrata-idle-backend.
 * Spring exposes {@code GET /trees} (not under /api — auth is under /api/auth).
 */
export async function fetchTrees(): Promise<FetchTreesResult> {
  const { data, ok, error } = await apiRequest<Tree[]>('/trees');
  if (!ok) {
    return {
      trees: [],
      error: error ?? 'Could not load trees. Is the backend running?',
    };
  }
  if (!Array.isArray(data)) {
    return { trees: [], error: 'Unexpected response from server.' };
  }
  return { trees: data, error: null };
}

export interface ChopTreeResult {
  userId: number;
  treeId: number;
  xpGranted: number;
  woodcuttingXpTotal: number;
  storageDeltas?: StorageDelta[];
}

export interface StorageDelta {
  itemKey: string;
  itemName: string;
  itemImageUrl: string;
  quantityAdded: number;
  newQuantity: number;
}

export async function chopTree(treeId: number): Promise<{ result?: ChopTreeResult; error?: string }> {
  const auth = getStoredAuth();
  if (!auth) {
    return { error: 'You must be logged in to train skills.' };
  }
  const { data, ok, status, error } = await apiRequest<ChopTreeResult>(`/trees/${treeId}/chop`, {
    method: 'POST',
    username: auth.username,
    password: auth.password,
  });
  if (ok && data) {
    return { result: data };
  }
  if (status === 401) {
    return { error: 'Your session expired. Please log in again.' };
  }
  return { error: error ?? 'Could not save woodcutting XP.' };
}
