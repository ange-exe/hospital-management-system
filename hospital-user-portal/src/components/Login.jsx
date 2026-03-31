import React, { useState } from 'react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter a username.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (username.trim().toLowerCase() === 'admin') {
        window.location.href = 'http://localhost:5174';
      } else {
        onLogin(username.trim());
      }
    }, 500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f4c35 0%, #1a7a52 100%)',
      padding: '2rem',
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64,
            background: 'var(--color-primary, #0f4c35)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', margin: '0 auto 1rem',
          }}>
            🏥
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f4c35', marginBottom: '0.25rem' }}>
            Health Portal
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Hospital Management System
          </p>
        </div>

        {/* Form */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block', marginBottom: '0.5rem',
            fontWeight: 600, fontSize: '0.875rem', color: '#1e293b'
          }}>
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
            placeholder="Enter your username"
            autoFocus
            style={{
              width: '100%', padding: '0.75rem 1rem',
              border: '1px solid #e2e8f0', borderRadius: '8px',
              fontSize: '0.95rem', outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#0f4c35'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        {error && (
          <div style={{
            padding: '0.75rem', background: 'rgba(239,68,68,0.1)',
            color: '#dc2626', borderRadius: '8px',
            marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          style={{
            width: '100%', padding: '0.875rem',
            background: isLoading ? '#94a3b8' : 'linear-gradient(135deg, #0f4c35, #1a7a52)',
            color: 'white', border: 'none', borderRadius: '8px',
            fontWeight: 700, fontSize: '1rem', cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s',
          }}
        >
          {isLoading ? 'Signing in...' : 'Continue →'}
        </button>

        {/* Hint */}
        <div style={{
          marginTop: '2rem', padding: '1rem',
          background: '#f8fafc', borderRadius: '8px',
          fontSize: '0.75rem', color: '#64748b', textAlign: 'center',
          lineHeight: 1.6,
        }}>
          Enter <strong>admin</strong> to access the Admin Panel<br />
          Any other username enters the Patient Portal
        </div>
      </div>
    </div>
  );
}

export default Login;