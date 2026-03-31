import React, { useState } from 'react';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

  .hp-navbar {
    position: sticky;
    top: 0;
    z-index: 200;
    background: rgba(255, 252, 247, 0.88);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border-bottom: 1px solid rgba(180, 160, 130, 0.18);
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .hp-navbar-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 2rem;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
  }

  /* ── Logo ── */
  .hp-logo {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
    cursor: pointer;
    flex-shrink: 0;
  }

  .hp-logo-mark {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #3d7a6f, #5ba89b);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    box-shadow: 0 3px 10px rgba(61, 122, 111, 0.3);
  }

  .hp-logo-text {
    font-family: 'Fraunces', serif;
    font-weight: 700;
    font-size: 1.1rem;
    color: #1c3530;
    letter-spacing: -0.01em;
  }

  /* ── Links ── */
  .hp-links {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
    flex: 1;
    justify-content: center;
  }

  .hp-link {
    position: relative;
    padding: 0.45rem 0.875rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #5a6b65;
    cursor: pointer;
    transition: color 0.18s, background 0.18s;
    white-space: nowrap;
    user-select: none;
  }

  .hp-link:hover {
    color: #1c3530;
    background: rgba(61, 122, 111, 0.08);
  }

  .hp-link.active {
    color: #3d7a6f;
    background: rgba(61, 122, 111, 0.1);
    font-weight: 600;
  }

  .hp-link.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 20%;
    right: 20%;
    height: 2px;
    border-radius: 2px 2px 0 0;
    background: linear-gradient(90deg, #3d7a6f, #5ba89b);
  }

  /* ── Right actions ── */
  .hp-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  .hp-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e8b87a, #d4956a);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Fraunces', serif;
    font-weight: 700;
    font-size: 0.85rem;
    color: white;
    box-shadow: 0 2px 8px rgba(212, 149, 106, 0.35);
    cursor: pointer;
  }

  .hp-logout {
    padding: 0.45rem 1.1rem;
    border-radius: 8px;
    border: 1.5px solid rgba(180, 60, 60, 0.3);
    background: transparent;
    color: #b83c3c;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s;
    letter-spacing: 0.01em;
  }

  .hp-logout:hover {
    background: #b83c3c;
    color: white;
    border-color: #b83c3c;
    box-shadow: 0 2px 10px rgba(184, 60, 60, 0.3);
  }

  /* ── Mobile hamburger ── */
  .hp-hamburger {
    display: none;
    flex-direction: column;
    gap: 4px;
    cursor: pointer;
    padding: 4px;
    background: none;
    border: none;
  }

  .hp-hamburger span {
    display: block;
    width: 22px;
    height: 2px;
    border-radius: 2px;
    background: #3d7a6f;
    transition: all 0.2s;
  }

  .hp-mobile-menu {
    display: none;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem 1.5rem 1rem;
    border-top: 1px solid rgba(180, 160, 130, 0.15);
    background: rgba(255, 252, 247, 0.96);
  }

  .hp-mobile-menu.open { display: flex; }

  .hp-mobile-link {
    padding: 0.6rem 0.75rem;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    color: #5a6b65;
    cursor: pointer;
    transition: all 0.15s;
  }

  .hp-mobile-link.active {
    color: #3d7a6f;
    background: rgba(61, 122, 111, 0.1);
    font-weight: 600;
  }

  .hp-mobile-link:hover { background: rgba(61, 122, 111, 0.07); }

  @media (max-width: 768px) {
    .hp-links { display: none; }
    .hp-hamburger { display: flex; }
    .hp-logout { font-size: 0.75rem; padding: 0.4rem 0.8rem; }
  }
`;

const navItems = [
  { id: 'home',         label: 'Home' },
  { id: 'records',      label: 'Medical Records' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'articles',     label: 'Health Articles' },
  { id: 'receipts',     label: 'Receipts' },
];

function Navbar({ currentPage, setCurrentPage, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <style>{styles}</style>
      <nav className="hp-navbar">
        <div className="hp-navbar-inner">
          {/* Logo */}
          <div className="hp-logo" onClick={() => setCurrentPage('home')}>
            <div className="hp-logo-mark">⚕</div>
            <span className="hp-logo-text">Health Portal</span>
          </div>

          {/* Desktop links */}
          <ul className="hp-links">
            {navItems.map((item) => (
              <li
                key={item.id}
                className={`hp-link ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => setCurrentPage(item.id)}
              >
                {item.label}
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="hp-actions">
            <div className="hp-avatar" title="Raju Rastogi">R</div>
            <button className="hp-logout" onClick={onLogout}>Logout</button>
            <button
              className="hp-hamburger"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`hp-mobile-menu ${mobileOpen ? 'open' : ''}`}>
          {navItems.map((item) => (
            <div
              key={item.id}
              className={`hp-mobile-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => { setCurrentPage(item.id); setMobileOpen(false); }}
            >
              {item.label}
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}

export default Navbar;