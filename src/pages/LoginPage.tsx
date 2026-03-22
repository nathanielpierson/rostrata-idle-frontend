import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { error: err } = await login(username.trim(), password);
      if (err) {
        setError(err);
        return;
      }
      navigate('/');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1 className="auth-card__title">Log in</h1>
        <p className="auth-card__subtitle">Enter your credentials to continue.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <p className="auth-form__error" role="alert">{error}</p>}
          <label className="auth-form__label">
            Username
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="auth-form__input"
              required
            />
          </label>
          <label className="auth-form__label">
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-form__input"
              required
            />
          </label>
          <button type="submit" className="auth-form__submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Log in'}
          </button>
        </form>
        <p className="auth-card__footer">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </section>
    </main>
  );
}
