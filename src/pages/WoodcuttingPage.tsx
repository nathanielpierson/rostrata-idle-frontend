import { useState, useCallback, useEffect, useRef } from 'react'
import { fetchTrees } from '../api/trees'
import type { Tree } from '../types/tree'
import './WoodcuttingPage.css'

const XP_PER_CUT = 10

const BASE_XP_LEVEL_2 = 500
const LEVEL_MULTIPLIER = 1.09
const MAX_LEVEL = 100

/** Total XP required to reach a level (level 1 = 0, level 2 = 500, then +9% per level). */
function xpToReachLevel(level: number): number {
  if (level <= 1) return 0
  if (level > MAX_LEVEL) level = MAX_LEVEL
  return (
    BASE_XP_LEVEL_2 *
    (Math.pow(LEVEL_MULTIPLIER, level - 1) - 1) /
    (LEVEL_MULTIPLIER - 1)
  )
}

function getLevelFromXp(xp: number): number {
  if (xp < BASE_XP_LEVEL_2) return 1
  for (let level = MAX_LEVEL; level >= 1; level--) {
    if (xp >= xpToReachLevel(level)) return level
  }
  return 1
}

function formatChopSeconds(seconds: number): string {
  if (Number.isInteger(seconds)) return `${seconds}s`
  return `${seconds.toFixed(1)}s`
}

function chopDurationMs(tree: Tree): number {
  return Math.max(1, tree.secondsToChop) * 1000
}

export default function WoodcuttingPage() {
  const [xp, setXp] = useState(0)
  const [trees, setTrees] = useState<Tree[]>([])
  const [isLoadingTrees, setIsLoadingTrees] = useState(true)
  const [treesError, setTreesError] = useState<string | null>(null)

  const [isCutting, setIsCutting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [cuttingTree, setCuttingTree] = useState<Tree | null>(null)

  const cutStartRef = useRef<number | null>(null)
  const cutDurationMsRef = useRef(15_000)

  const level = getLevelFromXp(xp)
  const xpAtLevel = xpToReachLevel(level)
  const xpAtNextLevel =
    level < MAX_LEVEL ? xpToReachLevel(level + 1) : xpAtLevel
  const xpInLevel = xp - xpAtLevel
  const xpNeededForNext = xpAtNextLevel - xpAtLevel
  const progressToNext =
    xpNeededForNext > 0 ? (xpInLevel / xpNeededForNext) * 100 : 100

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const { trees: list, error } = await fetchTrees()
      if (!mounted) return
      setTrees(list)
      setTreesError(error)
      setIsLoadingTrees(false)
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const startChop = useCallback(
    (tree: Tree) => {
      if (isCutting || level < tree.levelRequirement) return
      const ms = chopDurationMs(tree)
      cutDurationMsRef.current = ms
      cutStartRef.current = Date.now()
      setCuttingTree(tree)
      setIsCutting(true)
      setProgress(0)
    },
    [isCutting, level],
  )

  useEffect(() => {
    if (!isCutting || cutStartRef.current === null || !cuttingTree) return
    const durationMs = cutDurationMsRef.current
    const interval = setInterval(() => {
      const elapsed = Date.now() - (cutStartRef.current ?? 0)
      setProgress(Math.min((elapsed / durationMs) * 100, 100))
      if (elapsed >= durationMs) {
        setXp((prev) => prev + XP_PER_CUT)
        setIsCutting(false)
        setProgress(0)
        setCuttingTree(null)
        cutStartRef.current = null
      }
    }, 100)
    return () => clearInterval(interval)
  }, [isCutting, cuttingTree])

  const activeDurationMs = cuttingTree
    ? chopDurationMs(cuttingTree)
    : cutDurationMsRef.current

  const hintWhenIdle = (): string => {
    if (isLoadingTrees) return 'Loading trees…'
    if (treesError)
      return treesError
    if (trees.length === 0) {
      return 'No trees in the database. On the backend, seed defaults (POST /trees/seed-defaults) or add trees via POST /trees.'
    }
    return 'Click a tree you are high enough level to chop.'
  }

  return (
    <main className="woodcutting">
      <h1 className="woodcutting__title">Woodcutting</h1>
      <p className="woodcutting__level">Level {level}</p>

      <div className="woodcutting__stats">
        <span className="woodcutting__xp">XP: {xp}</span>
        {level < MAX_LEVEL && (
          <span className="woodcutting__xp-next">
            ({Math.floor(xpInLevel)} / {Math.floor(xpNeededForNext)} to next)
          </span>
        )}
      </div>
      {level < MAX_LEVEL && (
        <div
          className="woodcutting__level-progress-wrap"
          role="progressbar"
          aria-valuenow={progressToNext}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progress to next level"
        >
          <div
            className="woodcutting__level-progress-bar"
            style={{ width: `${progressToNext}%` }}
          />
        </div>
      )}

      <section className="woodcutting__area">
        <p className="woodcutting__hint">
          {isCutting && cuttingTree
            ? `Cutting ${cuttingTree.name}… ${Math.ceil((activeDurationMs / 1000) * (1 - progress / 100))}s`
            : hintWhenIdle()}
        </p>
        {isCutting && (
          <div className="woodcutting__progress-wrap">
            <div
              className="woodcutting__progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <ul className="woodcutting__trees">
          {trees.map((tree) => {
            const locked = level < tree.levelRequirement
            const isThisCutting = isCutting && cuttingTree?.id === tree.id
            return (
              <li key={tree.id} className="woodcutting__tree-item">
                <button
                  type="button"
                  className={
                    locked
                      ? 'woodcutting__tree woodcutting__tree--locked'
                      : 'woodcutting__tree'
                  }
                  onClick={() => startChop(tree)}
                  disabled={isCutting || locked}
                  aria-label={
                    locked
                      ? `${tree.name}, requires level ${tree.levelRequirement}`
                      : `Chop ${tree.name}`
                  }
                >
                  {tree.imageUrl ? (
                    <img
                      src={tree.imageUrl}
                      alt={tree.name}
                      className="woodcutting__tree-img"
                    />
                  ) : (
                    <div className="woodcutting__tree-img woodcutting__tree-img--placeholder">
                      No image
                    </div>
                  )}
                  <span className="woodcutting__tree-label">{tree.name}</span>
                  <span className="woodcutting__tree-meta">
                    Lv {tree.levelRequirement} ·{' '}
                    {formatChopSeconds(tree.secondsToChop)}
                  </span>
                  {locked && (
                    <span className="woodcutting__tree-lock">
                      Need Lv {tree.levelRequirement}
                    </span>
                  )}
                  {isThisCutting && (
                    <span className="woodcutting__tree-active" aria-live="polite">
                      Cutting…
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}
