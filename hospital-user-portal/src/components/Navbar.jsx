import React from 'react';

function Navbar({ currentPage, setCurrentPage }) {
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
      </div>
    </nav>
  );
}

export default Navbar;
