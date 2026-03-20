import { apiRequest } from './client';
import type { Tree } from '../types/tree';

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
