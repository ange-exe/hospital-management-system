import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import VideoCall from './VideoCall';

function MedicalRecords() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [activeCalls, setActiveCalls] = useState({});
const [openCall, setOpenCall] = useState(null);

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
    setLoading(true);

    // Real-time appointments
    const appointmentsRef = collection(db, 'appointments');
    const appointmentsQuery = query(
      appointmentsRef,
      where('patientId', '==', currentUser.id),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setAppointments(list);
      setLoading(false);
      console.log('✅ Real-time appointments updated:', list.length);
    }, (error) => {
      console.error('❌ Appointments error:', error);
      setLoading(false);
    });

    // Real-time prescriptions
    const prescriptionsRef = collection(db, 'prescriptions');
    const prescriptionsQuery = query(
      prescriptionsRef,
      where('patientId', '==', currentUser.id),
      orderBy('createdAt', 'desc')
    );
    const unsubscribePrescriptions = onSnapshot(prescriptionsQuery, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setPrescriptions(list);
      console.log('✅ Real-time prescriptions updated:', list.length);
    }, (error) => {
      console.error('❌ Prescriptions error:', error);
    });

    // Real-time lab results
    const labResultsRef = collection(db, 'labResults');
    const labResultsQuery = query(
      labResultsRef,
      where('patientId', '==', currentUser.id),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeLabResults = onSnapshot(labResultsQuery, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setLabResults(list);
      console.log('✅ Real-time lab results updated:', list.length);
    }, (error) => {
      console.error('❌ Lab results error:', error);
    });

    // Cleanup all listeners when component unmounts
    return () => {
      unsubscribeAppointments();
      unsubscribePrescriptions();
      unsubscribeLabResults();
    };
  }, []); // ← outer useEffect closes here, cleanly

  // Separate listener for live calls
  useEffect(() => {
    const timer = setTimeout(() => {
      const unsub = onSnapshot(collection(db, 'calls'), (snap) => {
        const live = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.status === 'calling' || data.status === 'active') {
            live[d.id] = { ...data, callDocId: d.id };
          }
        });
        setActiveCalls(live);
      });
      return () => unsub();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="loading">Loading medical records...</div>;
  }

  return (
    <div className="slide-up">
      {/* ── VIDEO CALL OVERLAY ── */}
      {openCall && (
        <VideoCall
          appointment={openCall}
          currentUser={{ uid: currentUser.id, displayName: currentUser.name, email: '', role: 'patient' }}
          onClose={() => setOpenCall(null)}
        />
      )}
      <div className="page-header">
        <h1>Medical Records</h1>
        <p>Complete overview of your health history and current medications</p>
      </div>
{appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').length > 0 && (
  <div style={{
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '12px',
    padding: '1rem 1.5rem',
    marginBottom: '1.5rem',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  }}>
    <span style={{ fontSize: '1.5rem' }}>📅</span>
    <div>
      <p style={{ fontWeight: '700', margin: 0 }}>Next Appointment</p>
      <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
        {appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').sort((a,b) => new Date(a.date) - new Date(b.date))[0].date} at {appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').sort((a,b) => new Date(a.date) - new Date(b.date))[0].time} — {appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').sort((a,b) => new Date(a.date) - new Date(b.date))[0].department}
      </p>
    </div>
  </div>
)}

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
  visit.status === 'completed' ? 'success' :
  visit.status === 'cancelled' ? 'cancelled' :
  'pending'
}`}>{visit.status || 'pending'}</span></p>

{visit.paymentStatus === 'paid' && (
  <p><strong>Payment:</strong> <span className="badge badge-success">Paid</span></p>
)}

                  {/* QR Code - shows until appointment is completed */}
                  {visit.status !== 'completed' && visit.status !== 'cancelled' && (
  <div style={{
    marginTop: '1rem',
    padding: '1rem',
    background: 'white',
    borderRadius: '12px',
    border: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    flexWrap: 'wrap'
  }}>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>
        <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
          🏥 Your Appointment QR Code
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
          Show this at the hospital reception
        </p>
      </div>

      {/* Video call box — always visible */}
      <div style={{
        padding: '0.75rem 1rem',
        background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
        borderRadius: '10px',
        border: '1px solid #86efac',
      }}>
        <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#15803d', marginBottom: '0.25rem' }}>
          📹 Video Consultation
        </p>
        {(() => {
          const liveCall = Object.values(activeCalls).find(
            c => c.appointmentId === visit.id
          ) || (Object.values(activeCalls)[0] || null);

          if (liveCall) {
            return (
              <button
                onClick={() => setOpenCall({ appointment: visit, callDocId: liveCall.callDocId })}
                style={{
                  marginTop: '0.4rem',
                  padding: '0.6rem 1.2rem',
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#a7f3d0',
                  display: 'inline-block',
                  animation: 'dot-pulse 1.2s ease-in-out infinite'
                }}/>
                Join Call — Doctor is waiting
              </button>
            );
          }

          return (
            <p style={{ fontSize: '0.8rem', color: '#16a34a', margin: 0 }}>
              Your doctor will start a call when ready. You'll see a Join button here.
            </p>
          );
        })()}
      </div>
    </div>
    {console.log('Visit ID:', visit.id)}
    <QRCodeSVG
      value={visit.id}
      size={120}
      level="L"
      marginSize={10}
    />
  </div>
)}
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
      <style>{`
  @keyframes dot-pulse {
    0%,100% { transform:scale(1); opacity:1; }
    50%      { transform:scale(1.7); opacity:.4; }
  }
`}</style>
    </div>
  );
}

export default MedicalRecords;