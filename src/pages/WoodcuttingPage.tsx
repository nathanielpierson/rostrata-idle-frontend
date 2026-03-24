import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { fetchTrees, chopTree } from '../api/trees'
import type { Tree } from '../types/tree'
import {
  getLevelFromXp,
  MAX_LEVEL,
  xpToReachLevel,
} from '../progression/xpProgression'
import { useAuth } from '../context/AuthContext'
import './WoodcuttingPage.css'

function chopDurationMs(tree: Tree): number {
  return Math.max(1, tree.secondsToChop) * 1000
}

export default function WoodcuttingPage() {
  const { user, loading: authLoading } = useAuth()
  const [xp, setXp] = useState(0)
  const [trees, setTrees] = useState<Tree[]>([])
  const [isLoadingTrees, setIsLoadingTrees] = useState(true)
  const [treesError, setTreesError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

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

  /** Never render tree cards until session is resolved and user is logged in. */
  const showTrees = Boolean(user) && !authLoading

  const treesByLevel = useMemo(
    () =>
      [...trees].sort((a, b) => {
        const byLevel = a.levelRequirement - b.levelRequirement
        if (byLevel !== 0) return byLevel
        return a.name.localeCompare(b.name)
      }),
    [trees],
  )

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setTrees([])
      setTreesError(null)
      setIsLoadingTrees(false)
      return
    }
    let mounted = true
    setIsLoadingTrees(true)
    const load = async () => {
      const { trees: list, error } = await fetchTrees()
      if (!mounted) return
      setTrees(list)
      setTreesError(error)
      setIsLoadingTrees(false)
    }
    void load()
    return () => {
      mounted = false
    }
  }, [authLoading, user])

  useEffect(() => {
    if (authLoading) return
    setXp(user?.woodcuttingXp ?? 0)
  }, [authLoading, user])

  const startChop = useCallback(
    (tree: Tree) => {
      if (!user) {
        setActionError('Log in to train woodcutting and save your XP.')
        return
      }
      if (isCutting || level < tree.levelRequirement) return
      setActionError(null)
      const ms = chopDurationMs(tree)
      cutDurationMsRef.current = ms
      cutStartRef.current = Date.now()
      setCuttingTree(tree)
      setIsCutting(true)
      setProgress(0)
    },
    [isCutting, level, user],
  )

  useEffect(() => {
    if (!isCutting || cutStartRef.current === null || !cuttingTree) return
    const durationMs = cutDurationMsRef.current
    const interval = setInterval(() => {
      const elapsed = Date.now() - (cutStartRef.current ?? 0)
      setProgress(Math.min((elapsed / durationMs) * 100, 100))
      if (elapsed >= durationMs) {
        // Stop immediately — otherwise this callback fires every 100ms until the
        // effect re-runs, sending duplicate POST /trees/{id}/chop requests.
        clearInterval(interval)
        setIsCutting(false)
        setProgress(0)
        const finishedTree = cuttingTree
        setCuttingTree(null)
        cutStartRef.current = null
        void (async () => {
          const { result, error } = await chopTree(finishedTree.id)
          if (result) {
            setXp(result.woodcuttingXpTotal)
            return
          }
          if (error) {
            setActionError(error)
          }
        })()
      }
    }, 100)
    return () => clearInterval(interval)
  }, [isCutting, cuttingTree])

  const hintWhenIdle = (): string => {
    if (authLoading) return 'Checking session…'
    if (!user) return 'Log in to see trees and train woodcutting.'
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
        <div className="woodcutting__status">
          <p className="woodcutting__hint">
            {isCutting && cuttingTree
              ? `Cutting ${cuttingTree.name}…`
              : hintWhenIdle()}
          </p>
          {actionError && (
            <p className="woodcutting__error" role="alert">{actionError}</p>
          )}
          {/* Keep progress slot mounted so the card / tree grid width stays stable when chopping */}
          <div
            className={`woodcutting__progress-wrap${isCutting ? '' : ' woodcutting__progress-wrap--idle'}`}
            aria-hidden={!isCutting}
          >
            <div
              className="woodcutting__progress-bar"
              style={{ width: isCutting ? `${progress}%` : '0%' }}
            />
          </div>
        </div>

        {showTrees && (
        <ul className="woodcutting__trees">
          {treesByLevel.map((tree) => {
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
                    Lv {tree.levelRequirement}
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
        )}
      </section>
    </main>
  )
}
