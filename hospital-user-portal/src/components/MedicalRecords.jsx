import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

function MedicalRecords() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labResults, setLabResults] = useState([]);

  // HARDCODED USER INFO (for now)
  const currentUser = {
    id: 'STU-2024-1847',  // This should match the patientId in Firebase
    name: 'Raju Rastogi',
    studentId: 'STU-2024-1847',
    dateOfBirth: 'March 15, 2006',
    bloodType: 'O+',
    allergies: 'Penicillin, Peanuts',
    emergencyContact: 'Mr. Rastogi (Father) - +9198765 43210'
  };

  useEffect(() => {
    loadMedicalRecords();
  }, []);

  const loadMedicalRecords = async () => {
    try {
      // Load appointments
      const appointmentsRef = collection(db, 'appointments');
      const appointmentsQuery = query(
        appointmentsRef,
        where('patientId', '==', currentUser.id),
        orderBy('createdAt', 'desc')
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      
      const appointmentsList = [];
      appointmentsSnapshot.forEach((doc) => {
        appointmentsList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setAppointments(appointmentsList);

      // Load prescriptions
      let prescriptionsList = [];
      try {
        const prescriptionsRef = collection(db, 'prescriptions');
        const prescriptionsQuery = query(
          prescriptionsRef,
          where('patientId', '==', currentUser.id),
          orderBy('createdAt', 'desc')
        );
        const prescriptionsSnapshot = await getDocs(prescriptionsQuery);
        
        prescriptionsSnapshot.forEach((doc) => {
          prescriptionsList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setPrescriptions(prescriptionsList);
      } catch (err) {
        console.log('No prescriptions yet');
        console.error('Prescription error:', err);
      }

      // Load lab results
      let labResultsList = [];
      try {
        const labResultsRef = collection(db, 'labResults');
        const labResultsQuery = query(
          labResultsRef,
          where('patientId', '==', currentUser.id),
          orderBy('createdAt', 'desc')
        );
        const labResultsSnapshot = await getDocs(labResultsQuery);
        
        labResultsSnapshot.forEach((doc) => {
          labResultsList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setLabResults(labResultsList);
      } catch (err) {
        console.log('No lab results yet');
        console.error('Lab results error:', err);
      }

      console.log('✅ Loaded:', { 
        appointments: appointmentsList.length, 
        prescriptions: prescriptions.length, 
        labResults: labResults.length 
      });

    } catch (error) {
      console.error('❌ Error loading medical records:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading medical records...</div>;
  }

  return (
    <div className="slide-up">
      <div className="page-header">
        <h1>Medical Records</h1>
        <p>Complete overview of your health history and current medications</p>
      </div>

      {/* Personal Information */}
      <div className="card">
        <div className="card-header">
          <h2>Personal Information</h2>
          <span className="badge badge-success">Verified</span>
        </div>
        <div className="info-grid">
          <div className="info-item">
            <div className="info-item-label">Full Name</div>
            <div className="info-item-value">{currentUser.name}</div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Student ID</div>
            <div className="info-item-value">{currentUser.studentId}</div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Date of Birth</div>
            <div className="info-item-value">{currentUser.dateOfBirth}</div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Blood Type</div>
            <div className="info-item-value">{currentUser.bloodType}</div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Known Allergies</div>
            <div className="info-item-value" style={{ color: 'var(--color-accent)' }}>
              {currentUser.allergies}
            </div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Emergency Contact</div>
            <div className="info-item-value">{currentUser.emergencyContact}</div>
          </div>
        </div>
      </div>

      {/* Active Prescriptions */}
      <div className="card">
        <div className="card-header">
          <h2>Active Prescriptions</h2>
          <span className="badge badge-info">{prescriptions.length} Active</span>
        </div>
        {prescriptions.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-light)' }}>
            No active prescriptions
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {prescriptions.map((rx) => (
              <div 
                key={rx.id}
                style={{ 
                  padding: '1.5rem', 
                  background: 'var(--color-background)', 
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                      {rx.medication}
                    </h4>
                    <p style={{ color: 'var(--color-text-light)' }}>
                      {rx.dosage} - {rx.frequency}
                    </p>
                  </div>
                  <span className="badge badge-success">Active</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                  <div>
                    <div style={{ color: 'var(--color-text-light)', marginBottom: '0.25rem' }}>Prescribed By</div>
                    <div style={{ fontWeight: '500' }}>{rx.doctor}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--color-text-light)', marginBottom: '0.25rem' }}>Date</div>
                    <div style={{ fontWeight: '500' }}>{rx.date}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--color-text-light)', marginBottom: '0.25rem' }}>Duration</div>
                    <div style={{ fontWeight: '500' }}>{rx.duration}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visit History */}
      <div className="card">
        <div className="card-header">
          <h2>Visit History</h2>
          <span className="badge badge-info">{appointments.length} Visits</span>
        </div>
        {appointments.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-light)' }}>
            No visit history available
          </div>
        ) : (
          <div className="timeline">
            {appointments.map((visit) => (
              <div key={visit.id} className="timeline-item">
                <div className="timeline-date">{visit.date}</div>
                <div className="timeline-content">
                  <h4>{visit.appointmentType}</h4>
                  <p><strong>Provider:</strong> {visit.provider}</p>
                  <p><strong>Department:</strong> {visit.department}</p>
                  {visit.diagnosis && (
                    <p><strong>Diagnosis:</strong> {visit.diagnosis}</p>
                  )}
                  {visit.notes && (
                    <p><strong>Notes:</strong> {visit.notes}</p>
                  )}
                  <p><strong>Status:</strong> <span className={`badge badge-${
                    visit.status === 'confirmed' ? 'success' : 
                    visit.status === 'cancelled' ? 'cancelled' : 
                    'pending'
                  }`}>{visit.status || 'pending'}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lab Results */}
      <div className="card">
        <div className="card-header">
          <h2>Recent Lab Results</h2>
          <span className="badge badge-info">{labResults.length} Results</span>
        </div>
        {labResults.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-light)' }}>
            No lab results available
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {labResults.map((lab) => (
              <div 
                key={lab.id}
                style={{ 
                  padding: '1.5rem', 
                  background: 'var(--color-background)', 
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-primary-dark)' }}>
                      {lab.testName}
                    </h4>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>
                      <strong>Result:</strong> {lab.result}
                    </p>
                    {lab.normalRange && (
                      <p style={{ color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>
                        <strong>Normal Range:</strong> {lab.normalRange}
                      </p>
                    )}
                    {lab.notes && (
                      <p style={{ color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>
                        <strong>Notes:</strong> {lab.notes}
                      </p>
                    )}
                    {lab.imageUrl && (
                      <div style={{ marginTop: '1rem' }}>
                        <a 
                          href={lab.imageUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                        >
                          📄 View Scan/Report
                        </a>
                      </div>
                    )}
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '0.5rem' }}>
                      Date: {lab.date}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MedicalRecords;