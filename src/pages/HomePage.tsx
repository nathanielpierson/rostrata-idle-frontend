import { Link } from 'react-router-dom'
import './HomePage.css'

export default function HomePage() {
  return (
    <main className="home">
      <section className="home__hero">
        <h1 className="home__title">Rostrata Idle</h1>
        <p className="home__tagline">A text-based MMORPG. Forge your legend, one word at a time.</p>
      </section>

      <section className="home__intro">
        <p className="home__intro-text">
          Enter a world of adventure, quests, and conquest—all through the power of text.
          Level up your character, join guilds, battle monsters, and trade with other players
          in this persistent online realm.
        </p>
      </section>

      <section className="home__actions">
        <Link to="/play" className="home__cta home__cta--primary">
          Enter the Realm
        </Link>
        <Link to="/about" className="home__cta home__cta--secondary">
          Learn More
        </Link>
      </section>

      <section className="home__features">
        <h2 className="home__features-title">What awaits you</h2>
        <ul className="home__feature-list">
          <li>Idle progression — progress even when you're away</li>
          <li>Quests, combat, and crafting</li>
          <li>Guilds and world events</li>
          <li>Leaderboards and achievements</li>
        </ul>
      </section>
    </main>
  );
}
