import { Link } from 'react-router-dom'
import './MiningPage.css'

export default function MiningPage() {
  return (
    <main className="coming-soon">
      <h1 className="coming-soon__title">Mining</h1>
      <p className="coming-soon__message">Mining is coming soon.</p>
      <Link className="coming-soon__back" to="/play">
        Back to Play
      </Link>
    </main>
  )
}

