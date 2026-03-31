import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import VideoCall from './VideoCall';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

  .rec-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #faf8f4;
    min-height: 100vh;
    color: #1c3530;
    padding-bottom: 4rem;
  }

  .rec-page-header {
    padding: 2.5rem 2rem 0;
    max-width: 900px;
    margin: 0 auto;
  }

  .rec-page-header h1 {
    font-family: 'Fraunces', serif;
    font-size: 2rem;
    font-weight: 900;
    color: #1c3530;
    margin: 0 0 0.25rem;
    letter-spacing: -0.02em;
  }

  .rec-page-header p {
    font-size: 0.9rem;
    color: #7a8e89;
    margin: 0 0 2rem;
  }

  .rec-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  /* ── Next banner ── */
  .rec-next-banner {
    background: linear-gradient(135deg, #2d5a4f, #3d7a6f);
    border-radius: 14px;
    padding: 1.1rem 1.5rem;
    margin-bottom: 1.75rem;
    color: white;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 4px 18px rgba(45,90,79,0.25);
  }

  .rec-next-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    background: rgba(255,255,255,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.15rem; flex-shrink: 0;
  }

  .rec-next-label {
    font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.06em; color: rgba(255,255,255,0.65); margin: 0 0 0.15rem;
  }

  .rec-next-detail { font-size: 0.9rem; color: rgba(255,255,255,0.92); margin: 0; font-weight: 500; }

  /* ── Card ── */
  .rec-card {
    background: #fff;
    border-radius: 18px;
    border: 1px solid rgba(61,122,111,0.12);
    box-shadow: 0 2px 12px rgba(28,53,48,0.05);
    margin-bottom: 1.75rem;
    overflow: hidden;
  }

  .rec-card-header {
    padding: 1.4rem 1.75rem 1rem;
    border-bottom: 1px solid #f2f5f4;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .rec-card-title {
    font-family: 'Fraunces', serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #1c3530;
    margin: 0;
  }

  .rec-card-body { padding: 1.5rem 1.75rem; }

  /* ── Badge ── */
  .rec-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.7rem;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 700;
  }

  .rec-badge-success  { background: #dcfce7; color: #15803d; }
  .rec-badge-info     { background: #e0f2fe; color: #0369a1; }
  .rec-badge-pending  { background: #fef3c7; color: #92400e; }
  .rec-badge-cancelled{ background: #fee2e2; color: #991b1b; }

  /* ── Info grid (personal info) ── */
  .rec-info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  @media (max-width: 640px) { .rec-info-grid { grid-template-columns: 1fr 1fr; } }

  .rec-info-cell {
    background: #faf8f4;
    border-radius: 12px;
    padding: 1rem;
    border: 1px solid rgba(61,122,111,0.08);
  }

  .rec-info-label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #a0b5b0;
    margin-bottom: 0.35rem;
  }

  .rec-info-value {
    font-size: 0.92rem;
    font-weight: 600;
    color: #1c3530;
  }

  /* ── Prescription item ── */
  .rec-rx-item {
    background: #faf8f4;
    border-radius: 14px;
    padding: 1.25rem 1.5rem;
    border: 1px solid rgba(61,122,111,0.1);
    margin-bottom: 1rem;
  }

  .rec-rx-item:last-child { margin-bottom: 0; }

  .rec-rx-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
  }

  .rec-rx-name {
    font-family: 'Fraunces', serif;
    font-size: 1rem;
    font-weight: 600;
    color: #1c3530;
    margin: 0 0 0.2rem;
  }

  .rec-rx-dosage { font-size: 0.83rem; color: #7a8e89; margin: 0; }

  .rec-rx-meta {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    font-size: 0.8rem;
  }

  .rec-rx-meta-label { color: #a0b5b0; font-weight: 500; margin-bottom: 0.15rem; font-size: 0.7rem; }
  .rec-rx-meta-value { color: #1c3530; font-weight: 600; }

  /* ── Timeline ── */
  .rec-timeline {
    position: relative;
    padding-left: 1.5rem;
  }

  .rec-timeline::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, #3d7a6f, rgba(61,122,111,0.1));
    border-radius: 2px;
  }

  .rec-timeline-item {
    position: relative;
    margin-bottom: 1.75rem;
    padding-left: 1.25rem;
  }

  .rec-timeline-item:last-child { margin-bottom: 0; }

  .rec-timeline-item::before {
    content: '';
    position: absolute;
    left: -1.5rem;
    top: 0.35rem;
    width: 10px; height: 10px;
    border-radius: 50%;
    background: #3d7a6f;
    border: 2px solid #fff;
    box-shadow: 0 0 0 2px rgba(61,122,111,0.2);
  }

  .rec-timeline-date {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #3d7a6f;
    margin-bottom: 0.4rem;
  }

  .rec-timeline-content {
    background: #faf8f4;
    border-radius: 14px;
    padding: 1.25rem;
    border: 1px solid rgba(61,122,111,0.1);
    font-size: 0.875rem;
  }

  .rec-timeline-content h4 {
    font-family: 'Fraunces', serif;
    font-size: 1rem;
    font-weight: 600;
    color: #1c3530;
    margin: 0 0 0.5rem;
  }

  .rec-timeline-content p { color: #5a7a74; margin: 0 0 0.25rem; }

  /* ── QR strip inside timeline ── */
  .rec-qr-strip {
    margin-top: 1rem;
    padding: 1rem;
    background: #fff;
    border-radius: 12px;
    border: 1px solid rgba(61,122,111,0.12);
    display: flex;
    align-items: center;
    gap: 1.25rem;
    flex-wrap: wrap;
  }

  .rec-qr-info { flex: 1; display: flex; flex-direction: column; gap: 0.6rem; }

  .rec-qr-label {
    font-size: 0.82rem; font-weight: 600; color: #2d5a4f; margin: 0 0 0.15rem;
  }

  .rec-qr-sub { font-size: 0.75rem; color: #7a8e89; margin: 0; }

  .rec-video-box {
    background: linear-gradient(135deg, #f0fdf8, #dcfce7);
    border-radius: 10px;
    border: 1px solid #86efac;
    padding: 0.85rem 1rem;
  }

  .rec-video-box-title { font-size: 0.82rem; font-weight: 700; color: #15803d; margin: 0 0 0.25rem; }
  .rec-video-box-sub   { font-size: 0.75rem; color: #16a34a; margin: 0; }

  .rec-join-btn {
    margin-top: 0.5rem;
    padding: 0.55rem 1.1rem;
    background: #059669;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.82rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: background 0.15s;
  }

  .rec-join-btn:hover { background: #047857; }

  /* ── Lab results ── */
  .rec-lab-item {
    background: #faf8f4;
    border-radius: 14px;
    padding: 1.25rem;
    border: 1px solid rgba(61,122,111,0.1);
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  .rec-lab-item:last-child { margin-bottom: 0; }

  .rec-lab-name {
    font-family: 'Fraunces', serif;
    font-size: 1rem;
    font-weight: 600;
    color: #1c3530;
    margin: 0 0 0.4rem;
  }

  .rec-lab-row { color: #5a7a74; margin: 0 0 0.2rem; }

  /* ── Empty ── */
  .rec-empty {
    padding: 2.5rem;
    text-align: center;
    color: #a0b5b0;
    font-size: 0.875rem;
  }

  @keyframes hpFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes dot-pulse {
    0%,100% { transform:scale(1); opacity:1; }
    50%      { transform:scale(1.7); opacity:.4; }
  }
`;

function MedicalRecords() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [activeCalls, setActiveCalls] = useState({});
  const [openCall, setOpenCall] = useState(null);

  const currentUser = {
    id: 'STU-2024-1847',
    name: 'Raju Rastogi',
    studentId: 'STU-2024-1847',
    dateOfBirth: 'March 15, 2006',
    bloodType: 'O+',
    allergies: 'Penicillin, Peanuts',
    emergencyContact: 'Mr. Rastogi (Father) - +9198765 43210'
  };

  useEffect(() => {
    setLoading(true);
    const aRef = query(collection(db, 'appointments'), where('patientId', '==', currentUser.id), orderBy('createdAt', 'desc'));
    const unsubA = onSnapshot(aRef, (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (e) => { console.error(e); setLoading(false); });

    const pRef = query(collection(db, 'prescriptions'), where('patientId', '==', currentUser.id), orderBy('createdAt', 'desc'));
    const unsubP = onSnapshot(pRef, (snap) => setPrescriptions(snap.docs.map(d => ({ id: d.id, ...d.data() }))), console.error);

    const lRef = query(collection(db, 'labResults'), where('patientId', '==', currentUser.id), orderBy('createdAt', 'desc'));
    const unsubL = onSnapshot(lRef, (snap) => setLabResults(snap.docs.map(d => ({ id: d.id, ...d.data() }))), console.error);

    return () => { unsubA(); unsubP(); unsubL(); };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const unsub = onSnapshot(collection(db, 'calls'), (snap) => {
        const live = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.status === 'calling' || data.status === 'active') live[d.id] = { ...data, callDocId: d.id };
        });
        setActiveCalls(live);
      });
      return () => unsub();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#7a8e89' }}>Loading records…</div>;

  const activeAppts = appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').sort((a, b) => new Date(a.date) - new Date(b.date));

  const getBadgeClass = (status) => {
    if (status === 'confirmed' || status === 'completed') return 'rec-badge-success';
    if (status === 'cancelled') return 'rec-badge-cancelled';
    return 'rec-badge-pending';
  };

  const statusLabel = (s) => {
    if (s === 'confirmed') return '✓ Confirmed';
    if (s === 'completed') return '✓ Completed';
    if (s === 'cancelled') return '✕ Cancelled';
    return '⏳ Pending';
  };

  return (
    <div className="rec-root">
      <style>{styles}</style>

      {openCall && (
        <VideoCall
          appointment={openCall}
          currentUser={{ uid: currentUser.id, displayName: currentUser.name, email: '', role: 'patient' }}
          onClose={() => setOpenCall(null)}
        />
      )}

      <div className="rec-page-header">
        <h1>Medical Records</h1>
        <p>Complete overview of your health history and current medications</p>
      </div>

      <div className="rec-content">

        {activeAppts.length > 0 && (
          <div className="rec-next-banner">
            <div className="rec-next-icon">📅</div>
            <div>
              <div className="rec-next-label">Next Appointment</div>
              <div className="rec-next-detail">
                {activeAppts[0].date} at {activeAppts[0].time} — {activeAppts[0].department}
              </div>
            </div>
          </div>
        )}

        {/* Personal info */}
        <div className="rec-card">
          <div className="rec-card-header">
            <h2 className="rec-card-title">Personal Information</h2>
            <span className="rec-badge rec-badge-success">Verified</span>
          </div>
          <div className="rec-card-body">
            <div className="rec-info-grid">
              {[
                ['Full Name', currentUser.name],
                ['Student ID', currentUser.studentId],
                ['Date of Birth', currentUser.dateOfBirth],
                ['Blood Type', currentUser.bloodType],
                ['Known Allergies', currentUser.allergies],
                ['Emergency Contact', currentUser.emergencyContact],
              ].map(([label, value]) => (
                <div key={label} className="rec-info-cell">
                  <div className="rec-info-label">{label}</div>
                  <div className="rec-info-value" style={label === 'Known Allergies' ? { color: '#b83c3c' } : {}}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prescriptions */}
        <div className="rec-card">
          <div className="rec-card-header">
            <h2 className="rec-card-title">Active Prescriptions</h2>
            <span className="rec-badge rec-badge-info">{prescriptions.length} Active</span>
          </div>
          <div className="rec-card-body">
            {prescriptions.length === 0 ? (
              <div className="rec-empty">No active prescriptions</div>
            ) : (
              prescriptions.map((rx) => (
                <div key={rx.id} className="rec-rx-item">
                  <div className="rec-rx-header">
                    <div>
                      <div className="rec-rx-name">{rx.medication}</div>
                      <div className="rec-rx-dosage">{rx.dosage} — {rx.frequency}</div>
                    </div>
                    <span className="rec-badge rec-badge-success">Active</span>
                  </div>
                  <div className="rec-rx-meta">
                    {[['Prescribed By', rx.doctor], ['Date', rx.date], ['Duration', rx.duration]].map(([label, val]) => (
                      <div key={label}>
                        <div className="rec-rx-meta-label">{label}</div>
                        <div className="rec-rx-meta-value">{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Visit history */}
        <div className="rec-card">
          <div className="rec-card-header">
            <h2 className="rec-card-title">Visit History</h2>
            <span className="rec-badge rec-badge-info">{appointments.length} Visits</span>
          </div>
          <div className="rec-card-body">
            {appointments.length === 0 ? (
              <div className="rec-empty">No visit history available</div>
            ) : (
              <div className="rec-timeline">
                {appointments.map((visit) => {
                  const liveCall = Object.values(activeCalls).find(c => c.appointmentId === visit.id) || (Object.values(activeCalls)[0] || null);
                  return (
                    <div key={visit.id} className="rec-timeline-item">
                      <div className="rec-timeline-date">{visit.date}</div>
                      <div className="rec-timeline-content">
                        <h4>{visit.appointmentType || visit.reasonForVisit || 'Appointment'}</h4>
                        {visit.provider && <p><strong>Provider:</strong> {visit.provider}</p>}
                        {visit.department && <p><strong>Department:</strong> {visit.department}</p>}
                        {visit.diagnosis && <p><strong>Diagnosis:</strong> {visit.diagnosis}</p>}
                        {visit.notes && <p><strong>Notes:</strong> {visit.notes}</p>}
                        <p>
                          <strong>Status: </strong>
                          <span className={`rec-badge ${getBadgeClass(visit.status)}`}>{statusLabel(visit.status)}</span>
                        </p>
                        {visit.paymentStatus === 'paid' && (
                          <p><strong>Payment: </strong><span className="rec-badge rec-badge-success">Paid</span></p>
                        )}

                        {visit.status !== 'completed' && visit.status !== 'cancelled' && (
                          <div className="rec-qr-strip">
                            <div className="rec-qr-info">
                              <div>
                                <div className="rec-qr-label">🏥 Your Appointment QR Code</div>
                                <div className="rec-qr-sub">Show this at the hospital reception</div>
                              </div>
                              <div className="rec-video-box">
                                <div className="rec-video-box-title">📹 Video Consultation</div>
                                {liveCall ? (
                                  <button
                                    onClick={() => setOpenCall({ appointment: visit, callDocId: liveCall.callDocId })}
                                    className="rec-join-btn"
                                  >
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#a7f3d0', display: 'inline-block', animation: 'dot-pulse 1.2s ease-in-out infinite' }} />
                                    Join Call — Doctor is waiting
                                  </button>
                                ) : (
                                  <div className="rec-video-box-sub">
                                    Your doctor will start a call when ready. You'll see a Join button here.
                                  </div>
                                )}
                              </div>
                            </div>
                            <QRCodeSVG value={visit.id} size={110} level="L" marginSize={8} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Lab results */}
        <div className="rec-card">
          <div className="rec-card-header">
            <h2 className="rec-card-title">Recent Lab Results</h2>
            <span className="rec-badge rec-badge-info">{labResults.length} Results</span>
          </div>
          <div className="rec-card-body">
            {labResults.length === 0 ? (
              <div className="rec-empty">No lab results available</div>
            ) : (
              labResults.map((lab) => (
                <div key={lab.id} className="rec-lab-item">
                  <div className="rec-lab-name">{lab.testName}</div>
                  {lab.result && <div className="rec-lab-row"><strong>Result:</strong> {lab.result}</div>}
                  {lab.normalRange && <div className="rec-lab-row"><strong>Normal Range:</strong> {lab.normalRange}</div>}
                  {lab.notes && <div className="rec-lab-row"><strong>Notes:</strong> {lab.notes}</div>}
                  {lab.imageUrl && (
                    <a href={lab.imageUrl} target="_blank" rel="noopener noreferrer" style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                      marginTop: '0.75rem', padding: '0.45rem 0.9rem',
                      background: 'rgba(61,122,111,0.1)', color: '#2d5a4f',
                      borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                      textDecoration: 'none', transition: 'background 0.15s'
                    }}>
                      📄 View Scan/Report
                    </a>
                  )}
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#a0b5b0', fontWeight: 500 }}>Date: {lab.date}</div>
                </div>
              ))
            )}
          </div>
        </div>

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