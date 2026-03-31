import React from 'react';

function Navbar({ currentPage, setCurrentPage, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="#" className="navbar-logo" onClick={() => setCurrentPage('home')}>
          <div className="logo-icon">⚕</div>
          <span>Health Portal</span>
        </a>
        <ul className="navbar-links">
          <li>
            <a 
              href="#" 
              className={currentPage === 'home' ? 'active' : ''}
              onClick={() => setCurrentPage('home')}
            >
              Home
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={currentPage === 'records' ? 'active' : ''}
              onClick={() => setCurrentPage('records')}
            >
              Medical Records
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={currentPage === 'appointments' ? 'active' : ''}
              onClick={() => setCurrentPage('appointments')}
            >
              Appointments
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={currentPage === 'articles' ? 'active' : ''}
              onClick={() => setCurrentPage('articles')}
            >
              Health Articles
            </a>
          </li>
          <li>
  <a
    href="#"
    className={currentPage === 'receipts' ? 'active' : ''}
    onClick={() => setCurrentPage('receipts')}
  >
    Receipts
  </a>
</li>
        </ul>
        <button
          onClick={onLogout}
          style={{
  padding: '0.5rem 1.25rem',
  background: '#dc2626',
  color: '#ffffff',
  WebkitTextFillColor: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 700,
  fontSize: '0.875rem',
  cursor: 'pointer',
  marginLeft: '1rem',
}}
          onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.15)'; }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
