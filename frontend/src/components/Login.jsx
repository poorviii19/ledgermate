import { useState } from 'react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');
    onLogin({
      name: email.split('@')[0] || email,
      email: email.trim(),
      remember,
    });
  };

  return (
    <div className="login-shell">
      <div className="login-panel glass-card">
        <div className="login-header">
          <span className="login-brand">LedgerMate</span>
          <p className="subtitle">Secure access to your flatmate ledger, expense import, and settlements.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" aria-describedby="loginInstructions">
          <div id="loginInstructions" className="login-instructions">
            Use any email and password for now. This login gate improves the entry experience.
          </div>

          <div className="form-group">
            <label htmlFor="loginEmail">Email address</label>
            <input
              id="loginEmail"
              type="email"
              className="staging-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="loginPassword">Password</label>
            <input
              id="loginPassword"
              type="password"
              className="staging-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          <div className="form-group login-remember-row">
            <label>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me on this device
            </label>
          </div>

          {error && <div className="form-error" role="alert">{error}</div>}

          <button type="submit" className="btn-primary login-submit">Sign in</button>
        </form>
      </div>
    </div>
  );
}
