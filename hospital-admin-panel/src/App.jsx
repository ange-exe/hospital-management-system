import React, { useState } from 'react';
import './AdminApp.css';
import AdminLogin from './components/AdminLogin';
import AdminNavbar from './components/AdminNavbar';
import AdminDashboard from './components/AdminDashboard';
import AdminAppointments from './components/AdminAppointments';
import AdminDoctors from './components/AdminDoctors';
import AdminPatients from './components/AdminPatients';
import AdminMedicalRecords from './components/AdminMedicalRecords';
import AdminHealthArticles from './components/AdminHealthArticles';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      setIsLoggedIn(false);
      setCurrentPage('dashboard');
    }
  };

 const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'appointments':
        return <AdminAppointments />;
      case 'medical-records':
        return <AdminMedicalRecords />;
      case 'doctors':
        return <AdminDoctors />;
      case 'patients':
        return <AdminPatients />;
      case 'health-articles':
        return <AdminHealthArticles />;
      default:
        return <AdminDashboard />;
    }
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="admin-app">
      <AdminNavbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
      />
      <div className="admin-main">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
