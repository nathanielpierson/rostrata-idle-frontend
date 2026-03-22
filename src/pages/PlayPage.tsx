import { Link } from 'react-router-dom'
import './PlayPage.css'

export default function PlayPage() {
  return (
    <main className="play">
      <h1 className="play__title">Play</h1>
      <p className="play__intro">
        Choose a skill to train. Each skill will unlock new activities over time.
      </p>

      <div className="play__skills">
        <Link className="play__skill-card" to="/play/woodcutting">
          Woodcutting
        </Link>
        <Link className="play__skill-card" to="/play/fishing">
          Fishing
        </Link>
        <Link className="play__skill-card" to="/play/mining">
          Mining
        </Link>
        <Link className="play__skill-card" to="/play/hunting">
          Hunting
        </Link>
      </div>
    </main>
  )
}

