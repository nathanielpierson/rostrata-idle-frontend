/**
 * Matches `com.rostrata.idle.fish.Fish` JSON from rostrata-idle-backend (GET /fish).
 * Each catch uses a random duration in [minSecondsToFish, maxSecondsToFish] inclusive.
 */
export interface Fish {
  id: number;
  name: string;
  minSecondsToFish: number;
  maxSecondsToFish: number;
  imageUrl: string;
  levelRequirement: number;
}
