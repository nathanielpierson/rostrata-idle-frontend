import { useState, useCallback, useEffect, useRef } from 'react'
import './WoodcuttingPage.css'

const BUR_OAK_IMAGE =
  'https://scontent.fric1-2.fna.fbcdn.net/v/t51.75761-15/500482681_18323013763204797_5185688588855585874_n.jpg?stp=dst-jpegr_s1080x2048_tt6&_nc_cat=106&ccb=1-7&_nc_sid=13d280&_nc_ohc=ECYjqqC5NO0Q7kNvwEZ9Wdm&_nc_oc=Adn4-Nef1KXxlIdIoD6ZwWHVDHK_jH9O9OC7gtJ5fJc0Q6FUKBPcfBMJIo9QdckrBKQ&_nc_zt=23&se=-1&_nc_ht=scontent.fric1-2.fna&_nc_gid=ID0GTwlnUcOMZMIo2FvgmQ&_nc_ss=8&oh=00_Afzllo0n5zBwnmHEPhtZYeNlL_dABO3HvOXDKartkMNlcw&oe=69B39BD4'

const CUT_DURATION_MS = 15_000
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

export default function WoodcuttingPage() {
  const [xp, setXp] = useState(0)
  const [isCutting, setIsCutting] = useState(false)
  const [progress, setProgress] = useState(0)
  const cutStartRef = useRef<number | null>(null)

  const level = getLevelFromXp(xp)
  const xpAtLevel = xpToReachLevel(level)
  const xpAtNextLevel =
    level < MAX_LEVEL ? xpToReachLevel(level + 1) : xpAtLevel
  const xpInLevel = xp - xpAtLevel
  const xpNeededForNext = xpAtNextLevel - xpAtLevel
  const progressToNext =
    xpNeededForNext > 0 ? (xpInLevel / xpNeededForNext) * 100 : 100

  const handleTreeClick = useCallback(() => {
    if (isCutting) return
    setIsCutting(true)
    setProgress(0)
    cutStartRef.current = Date.now()
  }, [isCutting])

  useEffect(() => {
    if (!isCutting || cutStartRef.current === null) return
    const interval = setInterval(() => {
      const elapsed = Date.now() - (cutStartRef.current ?? 0)
      setProgress(Math.min((elapsed / CUT_DURATION_MS) * 100, 100))
      if (elapsed >= CUT_DURATION_MS) {
        setXp((prev) => prev + XP_PER_CUT)
        setIsCutting(false)
        setProgress(0)
        cutStartRef.current = null
      }
    }, 100)
    return () => clearInterval(interval)
  }, [isCutting])

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
        <div className="woodcutting__level-progress-wrap" role="progressbar" aria-valuenow={progressToNext} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to next level">
          <div
            className="woodcutting__level-progress-bar"
            style={{ width: `${progressToNext}%` }}
          />
        </div>
      )}

      <section className="woodcutting__area">
        <p className="woodcutting__hint">
          {isCutting
            ? `Cutting... ${Math.ceil((CUT_DURATION_MS / 1000) * (1 - progress / 100))}s`
            : 'Click the bur oak to chop.'}
        </p>
        {isCutting && (
          <div className="woodcutting__progress-wrap">
            <div
              className="woodcutting__progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        <button
          type="button"
          className="woodcutting__tree"
          onClick={handleTreeClick}
          disabled={isCutting}
          aria-label="Chop bur oak"
        >
          <img
            src={BUR_OAK_IMAGE}
            alt="Bur oak"
            className="woodcutting__tree-img"
          />
          <span className="woodcutting__tree-label">Bur Oak</span>
        </button>
      </section>
    </main>
  )
}
