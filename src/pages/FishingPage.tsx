import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { catchFish, fetchFish } from '../api/fish'
import type { StorageDelta } from '../api/trees'
import { fetchStorage } from '../api/storage'
import type { Fish } from '../types/fish'
import type { StorageItem } from '../types/storage'
import {
  getLevelFromXp,
  MAX_LEVEL,
  xpToReachLevel,
} from '../progression/xpProgression'
import { useAuth } from '../context/AuthContext'
import StoragePanel from '../components/StoragePanel'
import './FishingPage.css'

/** Random duration for this attempt, in seconds inclusive of min and max. */
function randomFishDurationSeconds(fish: Fish): number {
  const min = Math.min(fish.minSecondsToFish, fish.maxSecondsToFish)
  const max = Math.max(fish.minSecondsToFish, fish.maxSecondsToFish)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function fishDurationMs(fish: Fish): number {
  return Math.max(1, randomFishDurationSeconds(fish)) * 1000
}

export default function FishingPage() {
  const { user, loading: authLoading } = useAuth()
  const [xp, setXp] = useState(0)
  const [fishList, setFishList] = useState<Fish[]>([])
  const [isLoadingFish, setIsLoadingFish] = useState(true)
  const [fishError, setFishError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const [storageItems, setStorageItems] = useState<StorageItem[]>([])
  const [isLoadingStorage, setIsLoadingStorage] = useState(false)
  const [storageError, setStorageError] = useState<string | null>(null)

  const [isFishing, setIsFishing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeFish, setActiveFish] = useState<Fish | null>(null)

  const fishStartRef = useRef<number | null>(null)
  const fishDurationMsRef = useRef(15_000)

  const level = getLevelFromXp(xp)
  const xpAtLevel = xpToReachLevel(level)
  const xpAtNextLevel =
    level < MAX_LEVEL ? xpToReachLevel(level + 1) : xpAtLevel
  const xpInLevel = xp - xpAtLevel
  const xpNeededForNext = xpAtNextLevel - xpAtLevel
  const progressToNext =
    xpNeededForNext > 0 ? (xpInLevel / xpNeededForNext) * 100 : 100

  const showFishGrid = Boolean(user) && !authLoading
  const showStorage = Boolean(user) && !authLoading

  const fishByLevel = useMemo(
    () =>
      [...fishList].sort((a, b) => {
        const byLevel = a.levelRequirement - b.levelRequirement
        if (byLevel !== 0) return byLevel
        return a.name.localeCompare(b.name)
      }),
    [fishList],
  )

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setFishList([])
      setFishError(null)
      setIsLoadingFish(false)
      return
    }
    let mounted = true
    setIsLoadingFish(true)
    const load = async () => {
      const { fish, error } = await fetchFish()
      if (!mounted) return
      setFishList(fish)
      setFishError(error)
      setIsLoadingFish(false)
    }
    void load()
    return () => {
      mounted = false
    }
  }, [authLoading, user])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setStorageItems([])
      setStorageError(null)
      setIsLoadingStorage(false)
      return
    }

    let mounted = true
    setIsLoadingStorage(true)
    const load = async () => {
      const { items, error } = await fetchStorage()
      if (!mounted) return
      setStorageItems(items)
      setStorageError(error)
      setIsLoadingStorage(false)
    }
    void load()

    return () => {
      mounted = false
    }
  }, [authLoading, user])

  useEffect(() => {
    if (authLoading) return
    setXp(user?.fishingXp ?? 0)
  }, [authLoading, user])

  const applyStorageDeltas = useCallback((deltas: StorageDelta[]) => {
    setStorageItems((prev) => {
      const byKey = new Map(prev.map((i) => [i.itemKey, i]))
      for (const delta of deltas) {
        const existing = byKey.get(delta.itemKey)
        if (existing) {
          byKey.set(delta.itemKey, {
            ...existing,
            itemName: delta.itemName,
            itemImageUrl: delta.itemImageUrl,
            quantity: delta.newQuantity,
          })
        } else {
          byKey.set(delta.itemKey, {
            itemKey: delta.itemKey,
            itemName: delta.itemName,
            itemImageUrl: delta.itemImageUrl,
            quantity: delta.newQuantity,
          })
        }
      }
      return Array.from(byKey.values()).sort((a, b) =>
        a.itemName.localeCompare(b.itemName),
      )
    })
  }, [])

  const startFish = useCallback(
    (fish: Fish) => {
      if (!user) {
        setActionError('Log in to train fishing and save your XP.')
        return
      }
      if (isFishing || level < fish.levelRequirement) return
      setActionError(null)
      const ms = fishDurationMs(fish)
      fishDurationMsRef.current = ms
      fishStartRef.current = Date.now()
      setActiveFish(fish)
      setIsFishing(true)
      setProgress(0)
    },
    [isFishing, level, user],
  )

  useEffect(() => {
    if (!isFishing || fishStartRef.current === null || !activeFish) return
    const durationMs = fishDurationMsRef.current
    const interval = setInterval(() => {
      const elapsed = Date.now() - (fishStartRef.current ?? 0)
      setProgress(Math.min((elapsed / durationMs) * 100, 100))
      if (elapsed >= durationMs) {
        clearInterval(interval)
        setIsFishing(false)
        setProgress(0)
        const finished = activeFish
        setActiveFish(null)
        fishStartRef.current = null
        void (async () => {
          const { result, error } = await catchFish(finished.id)
          if (result) {
            setXp(result.fishingXpTotal)
            if (result.storageDeltas?.length) {
              applyStorageDeltas(result.storageDeltas)
            }
            return
          }
          if (error) {
            setActionError(error)
          }
        })()
      }
    }, 100)
    return () => clearInterval(interval)
  }, [isFishing, activeFish, applyStorageDeltas])

  const hintWhenIdle = (): string => {
    if (authLoading) return 'Checking session…'
    if (!user) return 'Log in to see fish and train fishing.'
    if (isLoadingFish) return 'Loading fish…'
    if (fishError)
      return fishError
    if (fishList.length === 0) {
      return 'No fish in the database. On the backend, seed defaults (POST /fish/seed-defaults) or add fish via POST /fish.'
    }
    return 'Click a fish you are high enough level to catch.'
  }

  return (
    <main className="fishing">
      <h1 className="fishing__title">Fishing</h1>
      <p className="fishing__level">Level {level}</p>

      <div className="fishing__stats">
        <span className="fishing__xp">XP: {xp}</span>
        {level < MAX_LEVEL && (
          <span className="fishing__xp-next">
            ({Math.floor(xpInLevel)} / {Math.floor(xpNeededForNext)} to next)
          </span>
        )}
      </div>
      {level < MAX_LEVEL && (
        <div
          className="fishing__level-progress-wrap"
          role="progressbar"
          aria-valuenow={progressToNext}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progress to next level"
        >
          <div
            className="fishing__level-progress-bar"
            style={{ width: `${progressToNext}%` }}
          />
        </div>
      )}

      <section className="fishing__area">
        <div className="fishing__status">
          <p className="fishing__hint">
            {isFishing && activeFish
              ? `Fishing for ${activeFish.name}…`
              : hintWhenIdle()}
          </p>
          {actionError && (
            <p className="fishing__error" role="alert">{actionError}</p>
          )}
          <div
            className={`fishing__progress-wrap${isFishing ? '' : ' fishing__progress-wrap--idle'}`}
            aria-hidden={!isFishing}
          >
            <div
              className="fishing__progress-bar"
              style={{ width: isFishing ? `${progress}%` : '0%' }}
            />
          </div>
        </div>

        {showFishGrid && (
        <ul className="fishing__fish-list">
          {fishByLevel.map((fish) => {
            const locked = level < fish.levelRequirement
            const isThisActive = isFishing && activeFish?.id === fish.id
            return (
              <li key={fish.id} className="fishing__fish-item">
                <button
                  type="button"
                  className={
                    locked
                      ? 'fishing__fish fishing__fish--locked'
                      : 'fishing__fish'
                  }
                  onClick={() => startFish(fish)}
                  disabled={isFishing || locked}
                  aria-label={
                    locked
                      ? `${fish.name}, requires level ${fish.levelRequirement}`
                      : `Fish for ${fish.name}`
                  }
                >
                  {fish.imageUrl ? (
                    <img
                      src={fish.imageUrl}
                      alt={fish.name}
                      className="fishing__fish-img"
                    />
                  ) : (
                    <div className="fishing__fish-img fishing__fish-img--placeholder">
                      No image
                    </div>
                  )}
                  <span className="fishing__fish-label">{fish.name}</span>
                  <span className="fishing__fish-meta">
                    Lv {fish.levelRequirement}
                  </span>
                  {locked && (
                    <span className="fishing__fish-lock">
                      Need Lv {fish.levelRequirement}
                    </span>
                  )}
                  {isThisActive && (
                    <span className="fishing__fish-active" aria-live="polite">
                      Fishing…
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
        )}
      </section>

      {showStorage && (
        <StoragePanel
          items={storageItems}
          loading={isLoadingStorage}
          error={storageError}
        />
      )}
    </main>
  )
}
