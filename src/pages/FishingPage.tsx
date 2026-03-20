import { Link } from 'react-router-dom'
import './FishingPage.css'

export default function FishingPage() {
  return (
    <main className="coming-soon">
      <h1 className="coming-soon__title">Fishing</h1>
      <p className="coming-soon__message">Fishing is coming soon.</p>
      <Link className="coming-soon__back" to="/play">
        Back to Play
      </Link>
    </main>
  )
}

