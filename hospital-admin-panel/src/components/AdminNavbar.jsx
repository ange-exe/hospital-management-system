import React from 'react';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .admin-sidebar {
    width: 260px;
    min-height: 100vh;
    background: linear-gradient(180deg, #0f2942 0%, #0a3d62 55%, #0d4f5c 100%);
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    box-shadow: 4px 0 24px rgba(15, 41, 66, 0.18);
    overflow: hidden;
  }

  .admin-sidebar::before {
    content: '';
    position: absolute;
    top: -80px;
    right: -80px;
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background: rgba(13, 148, 136, 0.12);
    pointer-events: none;
  }

  .admin-sidebar::after {
    content: '';
    position: absolute;
    bottom: 60px;
    left: -60px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.03);
    pointer-events: none;
  }

  .sidebar-header {
    padding: 1.75rem 1.5rem 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    position: relative;
    z-index: 1;
  }

  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .sidebar-logo-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, #0d9488, #14b8a6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
    box-shadow: 0 4px 14px rgba(13, 148, 136, 0.4);
    flex-shrink: 0;
  }

  .sidebar-logo-title {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.05rem;
    color: #fff;
    letter-spacing: -0.01em;
    display: block;
  }

  .sidebar-logo-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.68rem;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.4);
    margin-top: 0.1rem;
    display: block;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .sidebar-nav {
    flex: 1;
    padding: 1.25rem 0.875rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    position: relative;
    z-index: 1;
    overflow-y: auto;
  }

  .sidebar-nav::-webkit-scrollbar { width: 0; }

  .sidebar-nav-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.28);
    padding: 0 0.625rem;
    margin: 0.5rem 0 0.4rem;
  }

  .sidebar-nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.7rem 0.875rem;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.18s, color 0.18s, transform 0.15s;
    position: relative;
    overflow: hidden;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.55);
    letter-spacing: 0.01em;
    animation: sidebarSlideIn 0.3s ease both;
  }

  .sidebar-nav-item:hover {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.88);
    transform: translateX(2px);
  }

  .sidebar-nav-item.active {
    background: linear-gradient(135deg, rgba(13, 148, 136, 0.22), rgba(13, 148, 136, 0.1));
    color: #fff;
    font-weight: 600;
    box-shadow: inset 0 0 0 1px rgba(13, 148, 136, 0.3);
  }

  .sidebar-nav-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 20%;
    bottom: 20%;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background: linear-gradient(180deg, #14b8a6, #0d9488);
    box-shadow: 0 0 8px rgba(13, 148, 136, 0.6);
  }

  .sidebar-nav-icon {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
    border-radius: 8px;
    transition: background 0.18s;
  }

  .sidebar-nav-item.active .sidebar-nav-icon {
    background: rgba(13, 148, 136, 0.25);
  }

  .sidebar-nav-item:hover:not(.active) .sidebar-nav-icon {
    background: rgba(255, 255, 255, 0.05);
  }

  .sidebar-logout {
    padding: 0.875rem;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    position: relative;
    z-index: 1;
  }

  .sidebar-logout .sidebar-nav-item {
    color: rgba(255, 255, 255, 0.38);
    margin: 0;
  }

  .sidebar-logout .sidebar-nav-item:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #fca5a5;
    transform: translateX(2px);
  }

  @keyframes sidebarSlideIn {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
`;

const navItems = [
  { id: 'dashboard',       label: 'Dashboard',       icon: '⊞' },
  { id: 'appointments',    label: 'Appointments',     icon: '📅' },
  { id: 'medical-records', label: 'Medical Records',  icon: '🗂️' },
  { id: 'doctors',         label: 'Doctors',          icon: '👨‍⚕️' },
  { id: 'patients',        label: 'Patients',         icon: '👥' },
  { id: 'health-articles', label: 'Health Articles',  icon: '📰' },
];

function AdminNavbar({ currentPage, setCurrentPage, onLogout }) {
  return (
    <div className="admin-sidebar">
      <style>{styles}</style>

      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏥</div>
          <div>
            <span className="sidebar-logo-title">MediAdmin</span>
            <span className="sidebar-logo-sub">Control Panel</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">Main Menu</div>

        {navItems.map((item, i) => (
          <div
            key={item.id}
            className={`sidebar-nav-item ${currentPage === item.id ? 'active' : ''}`}
            style={{ animationDelay: `${0.04 + i * 0.04}s` }}
            onClick={() => setCurrentPage(item.id)}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-logout">
        <div className="sidebar-nav-item" onClick={onLogout}>
          <span className="sidebar-nav-icon">🚪</span>
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
}

export default AdminNavbar;