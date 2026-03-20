/**
 * Matches `com.rostrata.idle.tree.Tree` JSON from rostrata-idle-backend
 * (GET /trees — see TreeController).
 */
export interface Tree {
  id: number;
  name: string;
  /** Seconds to complete one chop (DB column `seconds_to_chop`) */
  secondsToChop: number;
  imageUrl: string;
  /** Minimum woodcutting level (DB column `level_requirement`) */
  levelRequirement: number;
}
