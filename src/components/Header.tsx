import { Link } from 'react-router-dom'
import './Header.css'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/play', label: 'Play' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/about', label: 'About' },
]

export default function Header() {
  return (
    <header className="header">
      <Link to="/" className="header__brand">
        Rostrata Idle
      </Link>
      <nav className="header__nav">
        {navLinks.map(({ to, label }) => (
          <Link key={to} to={to} className="header__link">
            {label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
