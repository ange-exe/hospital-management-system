import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      // Get unique patients from appointments
      const appointmentsRef = collection(db, 'appointments');
      const querySnapshot = await getDocs(appointmentsRef);
      
      const patientsMap = new Map();
      
      querySnapshot.forEach((doc) => {
        const appointment = doc.data();
        const patientId = appointment.patientId;
        
        if (patientId && !patientsMap.has(patientId)) {
          patientsMap.set(patientId, {
            id: patientId,
            name: appointment.patientName,
            appointments: []
          });
        }
        
        if (patientId) {
          patientsMap.get(patientId).appointments.push({
            id: doc.id,
            ...appointment
          });
        }
      });
      
      const patientsList = Array.from(patientsMap.values());
      setPatients(patientsList);
      console.log('✅ Loaded patients:', patientsList.length);
    } catch (error) {
      console.error('❌ Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading patients...</div>;
  }

  return (
    <div className="fade-in">
      <div className="admin-header">
        <h1>Patients</h1>
        <div className="admin-header-actions">
          <button className="btn btn-primary" onClick={loadPatients}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="admin-content">
        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-card-title">Total Patients</div>
            <div className="stat-card-value">{patients.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-title">Total Appointments</div>
            <div className="stat-card-value">
              {patients.reduce((sum, p) => sum + p.appointments.length, 0)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-title">Avg Appointments</div>
            <div className="stat-card-value">
              {patients.length > 0 
                ? (patients.reduce((sum, p) => sum + p.appointments.length, 0) / patients.length).toFixed(1)
                : 0
              }
            </div>
          </div>
        </div>

        {/* Patients List */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">All Patients ({patients.length})</h2>
          </div>
          <div className="admin-card-body" style={{ padding: 0 }}>
            {patients.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <h3 className="empty-state-title">No patients yet</h3>
                <p className="empty-state-text">Patients will appear here after they book appointments</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Name</th>
                    <th>Total Appointments</th>
                    <th>Last Visit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => {
                    const sortedAppointments = [...patient.appointments].sort((a, b) => 
                      new Date(b.date) - new Date(a.date)
                    );
                    const lastVisit = sortedAppointments[0];

                    return (
                      <tr key={patient.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                          {patient.id}
                        </td>
                        <td style={{ fontWeight: 600 }}>{patient.name}</td>
                        <td>
                          <span className="badge badge-info">
                            {patient.appointments.length} appointment{patient.appointments.length !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td>
                          {lastVisit ? (
                            <div>
                              <div>{lastVisit.date}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {lastVisit.appointmentType}
                              </div>
                            </div>
                          ) : 'N/A'}
                        </td>
                        <td>
                          <div className="table-actions">
                            <button 
                              className="btn btn-secondary"
                              onClick={() => setSelectedPatient(patient)}
                              title="View Details"
                            >
                              👁️ View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Patient Details Modal */}
        {selectedPatient && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <div style={{
                padding: '1.5rem 2rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Patient Details</h2>
                <button 
                  onClick={() => setSelectedPatient(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    {selectedPatient.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    Patient ID: {selectedPatient.id}
                  </div>
                </div>

                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
                  Appointment History ({selectedPatient.appointments.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {selectedPatient.appointments
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((appointment) => (
                      <div 
                        key={appointment.id}
                        style={{
                          padding: '1rem',
                          background: '#f8fafc',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <div style={{ fontWeight: 600 }}>{appointment.appointmentType}</div>
                          <span className={`badge badge-${
                            appointment.status === 'confirmed' ? 'success' : 
                            appointment.status === 'cancelled' ? 'cancelled' : 
                            'pending'
                          }`}>
                            {appointment.status || 'pending'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          <div>{appointment.date} at {appointment.time}</div>
                          <div>{appointment.provider} - {appointment.department}</div>
                          {appointment.reason && <div>Reason: {appointment.reason}</div>}
                        </div>
                      </div>
                    ))}
                </div>

                <button 
                  className="btn btn-secondary"
                  onClick={() => setSelectedPatient(null)}
                  style={{ marginTop: '1.5rem' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPatients;
