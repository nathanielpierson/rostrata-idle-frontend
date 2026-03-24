import './AboutPage.css'

export default function AboutPage() {
  return (
    <main className="about">
      <h1 className="about__title">About</h1>

      <section className="about__bio" aria-labelledby="about-bio-heading">
        <h2 id="about-bio-heading" className="visually-hidden">
          About the developer
        </h2>
        <p className="about__text">
          My name is Nathaniel, and I&apos;m a junior software developer developing a
          text-based MMO in a full stack web development environment. This game is based
          off of many MMOs I&apos;ve played that have a focus on advancing skills. I hope
          to add combat at some point, but I&apos;m focusing on simple concepts and
          working my way up. Feel free to contact me if you have any questions about the
          project or ideas on how to improve:
        </p>
      </section>

      <section className="about__contact-card" aria-labelledby="contact-heading">
        <h2 id="contact-heading" className="about__contact-title">
          Contact
        </h2>
        <dl className="about__contact-list">
          <div className="about__contact-row">
            <dt>Email</dt>
            <dd>
              <a href="mailto:nathanielepierson@gmail.com">
                nathanielepierson@gmail.com
              </a>
            </dd>
          </div>
          <div className="about__contact-row">
            <dt>LinkedIn</dt>
            <dd>
              <a
                href="https://www.linkedin.com/in/nathaniel-pierson/"
                target="_blank"
                rel="noopener noreferrer"
              >
                linkedin.com/in/nathaniel-pierson
              </a>
            </dd>
          </div>
        </dl>
      </section>
    </main>
  )
}
