import { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import MedicalRecords from './components/MedicalRecords';
import Appointments from './components/Appointments';
import HealthArticles from './components/HealthArticles';
import Receipts from './components/Receipts';
import Login from './components/Login';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [medicalRecordsAppointmentId, setMedicalRecordsAppointmentId] = useState(null); // NEW

  // NEW — called by Appointments when the patient clicks "Join Call"
  const handleNavigateToMedicalRecords = (appointmentId) => {
    setMedicalRecordsAppointmentId(appointmentId);
    setCurrentPage('records');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home setCurrentPage={setCurrentPage} />;
      case 'records':
        return (
          <MedicalRecords
            autoOpenCallAppointmentId={medicalRecordsAppointmentId} // NEW
          />
        );
      case 'appointments':
        return (
          <Appointments
            onNavigateToMedicalRecords={handleNavigateToMedicalRecords} // NEW
          />
        );
      case 'articles':
        return <HealthArticles />;
      case 'receipts':
        return <Receipts />;
      default:
        return <Home setCurrentPage={setCurrentPage} />;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={(user) => { setCurrentUser(user); setIsLoggedIn(true); }} />;
  }

  return (
    <div className="app">
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={() => setIsLoggedIn(false)}
      />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;