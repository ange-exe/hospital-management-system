import React from 'react';

function AdminNavbar({ currentPage, setCurrentPage, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'medical-records', label: 'Medical Records' },
    { id: 'doctors', label: 'Doctors' },
    { id: 'patients', label: 'Patients' },
    { id: 'health-articles', label: 'Health Articles' },
  ];

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏥</div>
          <span>Admin Panel</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`sidebar-nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => setCurrentPage(item.id)}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}

        <div
          className="sidebar-nav-item"
          onClick={onLogout}
          style={{ marginTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '2rem' }}
        >
          <span className="sidebar-nav-icon">🚪</span>
          <span>Logout</span>
        </div>
      </nav>
    </div>
  );
}

export default AdminNavbar;
