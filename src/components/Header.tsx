import './Header.css';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/play', label: 'Play' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/about', label: 'About' },
];

export default function Header() {
  return (
    <header className="header">
      <a href="/" className="header__brand">
        Rostrata Idle
      </a>
      <nav className="header__nav">
        {navLinks.map(({ href, label }) => (
          <a key={href} href={href} className="header__link">
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}
