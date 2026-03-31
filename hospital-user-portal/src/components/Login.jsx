import React, { useState } from 'react';

const ADMIN_URL = 'http://localhost:5174'; // ← change to your admin panel port

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    // If admin, redirect to admin panel
    if (username.toLowerCase() === 'admin') {
      window.location.href = ADMIN_URL;
      return;
    }

    // Otherwise log in as regular user
    onLogin({ username, role: 'patient' });
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>🏥</div>
        <h1 style={styles.title}>Health Portal</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.group}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.btn}>Sign In</button>
        </form>

        <p style={styles.hint}>Admin? Use username: <strong>admin</strong></p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f4c35 0%, #1a7a54 100%)',
    padding: '2rem',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '3rem',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    textAlign: 'center',
  },
  logo: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: '#0f4c35',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#64748b',
    marginBottom: '2rem',
    fontSize: '0.95rem',
  },
  form: {
    textAlign: 'left',
  },
  group: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    fontWeight: 600,
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
    color: '#1e293b',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  error: {
    color: '#dc2626',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  },
  btn: {
    width: '100%',
    padding: '0.875rem',
    background: 'linear-gradient(135deg, #0f4c35, #1a7a54)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
    fontFamily: 'inherit',
  },
  hint: {
    marginTop: '1.5rem',
    fontSize: '0.8rem',
    color: '#94a3b8',
  },
};

export default Login;