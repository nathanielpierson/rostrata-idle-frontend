import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Header.css'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/play', label: 'Play' },
  { to: '/skills', label: 'Skills' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/about', label: 'About' },
]

export default function Header() {
  const { user, loading, logout } = useAuth()

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
        {!loading && (
          user ? (
            <>
              <span className="header__user">{user.username}</span>
              <button type="button" onClick={logout} className="header__logout">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="header__link">Log in</Link>
              <Link to="/signup" className="header__link header__link--cta">Sign up</Link>
            </>
          )
        )}
      </nav>
    </header>
  )
}
