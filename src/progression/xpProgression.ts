/**
 * Skill XP curve — keep in sync with `com.rostrata.idle.progression.XpProgression` (backend).
 *
 * Band 1→2 = BASE_XP. Each next band = round(previousBand * mult(L)), L = level just finished.
 * mult ramps: 1.09 (L<60), 1.09→1.075 (L 60–69), 1.075→1.050 (L 70–89), 1.050 (L≥90).
 */

export const BASE_XP_LEVEL_1_TO_2 = 350
export const MAX_LEVEL = 100

export function multiplierAfterLeavingLevel(leavingLevel: number): number {
  if (leavingLevel < 60) return 1.09
  if (leavingLevel <= 69) {
    return 1.09 + (1.075 - 1.09) * (leavingLevel - 60) / 9
  }
  if (leavingLevel <= 89) {
    return 1.075 + (1.05 - 1.075) * (leavingLevel - 70) / 19
  }
  return 1.05
}

const cumulativeCache: number[] = (() => {
  const c: number[] = new Array(MAX_LEVEL + 1).fill(0)
  c[1] = 0
  let bandXp = BASE_XP_LEVEL_1_TO_2
  for (let level = 2; level <= MAX_LEVEL; level++) {
    c[level] = c[level - 1] + bandXp
    if (level < MAX_LEVEL) {
      bandXp = Math.round(bandXp * multiplierAfterLeavingLevel(level - 1))
    }
  }
  return c
})()

/** Total XP to enter `level` (level 1 = 0). Integer-rounded bands. */
export function xpToReachLevel(level: number): number {
  if (level <= 1) return 0
  const capped = Math.min(level, MAX_LEVEL)
  return cumulativeCache[capped]
}

export function getLevelFromXp(xp: number): number {
  if (xp < cumulativeCache[2]) return 1
  for (let level = MAX_LEVEL; level >= 1; level--) {
    if (xp >= cumulativeCache[level]) return level
  }
  return 1
}
