import { useState, useEffect } from 'react'
import './SkillsPage.css'

export type LevelRequirement = {
  level: number
  action: string
}

export type Skill = {
  id: string
  name: string
  description: string
  levelRequirements: LevelRequirement[]
  /** When true, modal shows a “coming soon” note instead of level requirements */
  comingSoon?: boolean
}

const SKILLS: Skill[] = [
  {
    id: 'woodcutting',
    name: 'Woodcutting',
    description:
      'As an interdimensional time traveler, your primary goal in this life is clear: cut tree. Big tree, small tree, red tree, fall tree. Logs are a primary resource for equipment you will need on your journey, but we expect you to do it for the thrill of the cut.',
    levelRequirements: [
      { level: 1, action: 'Chop basic trees (Oak, Pine)' },
      { level: 5, action: 'Chop Willow trees' },
      { level: 10, action: 'Chop Maple trees' },
      { level: 15, action: 'Chop Yew trees' },
      { level: 20, action: 'Chop Elder trees' },
    ],
  },
  {
    id: 'fishing',
    name: 'Fishing',
    description:
      "Wanna grab a cold one with the boys and chill in a boat on a river for several hours while convincing yourself you're developing a skill? Well then, it sounds like fishing is for you!",
    levelRequirements: [
      { level: 1, action: 'Fish in shallow waters' },
      { level: 5, action: 'Use a rod and bait' },
      { level: 10, action: 'Fish in rivers' },
      { level: 15, action: 'Deep-sea fishing' },
      { level: 20, action: 'Catch rare and legendary fish' },
    ],
  },
  {
    id: 'mining',
    name: 'Mining',
    description:
      'Trying to strike a rock? Yeah, you\'re probably a miner. Ores you mine will primarily be used in crafting weapons for melee and magic. You\'ll also have a chance at getting rare gems; the more advanced the rock, the rarer gems you\'ll get.',
    levelRequirements: [
      { level: 1, action: 'Mine Copper and Tin' },
      { level: 5, action: 'Mine Iron ore' },
      { level: 10, action: 'Mine Silver and Coal' },
      { level: 15, action: 'Mine Gold and Mithril' },
      { level: 20, action: 'Mine Adamantite; rare gem chance' },
    ],
  },
  {
    id: 'hunting',
    name: 'Hunting',
    description:
      "You're gonna use traps and stuff to catch animals for food. If you're good enough, you can even use your archery skill to help you out. As you go along, you will unlock different types of traps that will help you capture bigger and more evasive animals.",
    levelRequirements: [],
    comingSoon: true,
  },
]

type SkillModalProps = {
  skill: Skill
  onClose: () => void
}

function SkillModal({ skill, onClose }: SkillModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div className="skill-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="skill-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="skill-modal-title"
      >
        <div className="skill-modal__header">
          <h2 id="skill-modal-title" className="skill-modal__title">
            {skill.name}
          </h2>
          <button
            type="button"
            className="skill-modal__close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="skill-modal__body">
          <p className="skill-modal__description">{skill.description}</p>
          {skill.comingSoon ? (
            <p className="skill-modal__coming-soon">Level requirements — coming soon.</p>
          ) : (
            <section className="skill-modal__levels">
              <h3 className="skill-modal__levels-title">Level requirements</h3>
              <table className="skill-modal__table">
                <thead>
                  <tr>
                    <th>Level</th>
                    <th>Unlocks</th>
                  </tr>
                </thead>
                <tbody>
                  {skill.levelRequirements.map(({ level, action }) => (
                    <tr key={level}>
                      <td>{level}</td>
                      <td>{action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SkillsPage() {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)

  return (
    <main className="skills">
      <h1 className="skills__title">Skills</h1>
      <p className="skills__intro">
        Train your skills to unlock new activities and progress through the realm.
        Click a skill to view its description and level requirements.
      </p>
      <ul className="skills__list">
        {SKILLS.map((skill) => (
          <li key={skill.id}>
            <button
              type="button"
              className="skills__card"
              onClick={() => setSelectedSkill(skill)}
            >
              <span className="skills__card-name">{skill.name}</span>
            </button>
          </li>
        ))}
      </ul>
      {selectedSkill && (
        <SkillModal
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
        />
      )}
    </main>
  )
}
