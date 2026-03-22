import React, { useState } from 'react';

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simple password check (hardcoded for now)
    // TODO: Replace with proper authentication later
    if (password === 'admin123') {
      setTimeout(() => {
        onLogin();
      }, 500);
    } else {
      setIsLoading(false);
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card fade-in">
        <div className="login-header">
          <div className="login-logo">
            👨‍💼
          </div>
          <h1 className="login-title">Admin Portal</h1>
          <p className="login-subtitle">Health Portal Management System</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Admin Password
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              autoFocus
            />
          </div>

          {error && (
            <div style={{ 
              padding: '0.75rem', 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: '#dc2626',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login to Admin Panel'}
          </button>
        </form>

        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: 'rgba(59, 130, 246, 0.05)',
          borderRadius: '8px',
          fontSize: '0.75rem',
          color: '#64748b',
          textAlign: 'center'
        }}>
          <strong>Demo Password:</strong> admin123
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
