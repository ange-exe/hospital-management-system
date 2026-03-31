import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .apat-root {
    font-family: 'DM Sans', sans-serif;
    background: #f0f4f8;
    min-height: 100vh;
    color: #0f172a;
  }

  .apat-header {
    background: linear-gradient(135deg, #0f2942 0%, #0a3d62 60%, #0d6e6e 100%);
    padding: 1.75rem 2.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: hidden;
  }
  .apat-header::before {
    content: '';
    position: absolute;
    top: -50px; right: -50px;
    width: 180px; height: 180px;
    border-radius: 50%;
    background: rgba(13,148,136,0.15);
    pointer-events: none;
  }
  .apat-header h1 {
    font-family: 'Syne', sans-serif;
    font-size: 1.75rem; font-weight: 800;
    color: #fff; margin: 0; letter-spacing: -0.02em;
  }
  .apat-header p { color: rgba(255,255,255,0.5); font-size: 0.82rem; margin: 0.2rem 0 0; }

  .apat-content { padding: 2rem 2.5rem; max-width: 1400px; }

  /* Stats */
  .apat-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.1rem;
    margin: 1.75rem 0 1.5rem;
  }
  .apat-stat {
    background: #fff; border-radius: 14px; padding: 1.25rem 1.4rem;
    border: 1px solid #e8edf2; box-shadow: 0 1px 3px rgba(15,41,66,0.05);
    display: flex; align-items: center; gap: 1rem;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .apat-stat:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(15,41,66,0.09); }
  .apat-stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
  .apat-stat-label { font-size: 0.72rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.2rem; }
  .apat-stat-value { font-family: 'Syne', sans-serif; font-size: 1.7rem; font-weight: 800; line-height: 1; color: #0f172a; }

  /* Search bar */
  .apat-search-wrap {
    position: relative;
    margin-bottom: 1.5rem;
  }
  .apat-search-icon {
    position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);
    color: #94a3b8; font-size: 0.95rem;
  }
  .apat-search {
    width: 100%; box-sizing: border-box;
    padding: 0.7rem 1rem 0.7rem 2.5rem;
    border: 1px solid #e2e8f0; border-radius: 10px;
    font-size: 0.875rem; font-family: 'DM Sans', sans-serif;
    color: #334155; background: #fff; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-shadow: 0 1px 3px rgba(15,41,66,0.05);
  }
  .apat-search:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }

  /* Card */
  .apat-card {
    background: #fff; border-radius: 16px;
    border: 1px solid #e8edf2; box-shadow: 0 1px 4px rgba(15,41,66,0.06);
    margin-bottom: 1.5rem; overflow: hidden;
  }
  .apat-card-header {
    padding: 1.25rem 1.75rem; border-bottom: 1px solid #f1f5f9;
    display: flex; justify-content: space-between; align-items: center; gap: 1rem;
  }
  .apat-card-title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0; }
  .apat-divider { width: 36px; height: 3px; background: linear-gradient(90deg, #0d9488, #14b8a6); border-radius: 2px; margin: 0.3rem 0 0; }

  /* Table */
  .apat-table { width: 100%; border-collapse: collapse; }
  .apat-table thead tr { background: #f8fafc; }
  .apat-table th { padding: 0.75rem 1.25rem; text-align: left; font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #94a3b8; border-bottom: 1px solid #f1f5f9; }
  .apat-table td { padding: 1rem 1.25rem; font-size: 0.875rem; border-bottom: 1px solid #f8fafc; color: #334155; vertical-align: middle; }
  .apat-table tbody tr:last-child td { border-bottom: none; }
  .apat-table tbody tr { transition: background 0.15s; }
  .apat-table tbody tr:hover { background: #f8fafc; }

  /* Patient avatar */
  .apat-avatar {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, #0d9488, #14b8a6);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.85rem; color: white;
    flex-shrink: 0; box-shadow: 0 2px 6px rgba(13,148,136,0.25);
  }

  /* Badge */
  .apat-badge {
    display: inline-flex; align-items: center;
    padding: 0.22rem 0.65rem; border-radius: 20px;
    font-size: 0.7rem; font-weight: 700;
  }
  .apat-badge.info { background: #eff6ff; color: #2563eb; }
  .apat-badge.success { background: #d1fae5; color: #065f46; }
  .apat-badge.pending { background: #fef3c7; color: #92400e; }
  .apat-badge.cancelled { background: #fee2e2; color: #991b1b; }

  /* Buttons */
  .apat-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.55rem 1.2rem; border-radius: 9px;
    font-size: 0.82rem; font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; border: none; transition: all 0.18s; white-space: nowrap;
  }
  .apat-btn-primary { background: linear-gradient(135deg, #0d9488, #0f766e); color: white; box-shadow: 0 2px 8px rgba(13,148,136,0.28); }
  .apat-btn-primary:hover { box-shadow: 0 4px 16px rgba(13,148,136,0.42); transform: translateY(-1px); }
  .apat-btn-secondary { background: #f1f5f9; color: #475569; }
  .apat-btn-secondary:hover { background: #e2e8f0; }
  .apat-btn-sm { padding: 0.38rem 0.85rem; font-size: 0.75rem; border-radius: 7px; }

  /* Empty */
  .apat-empty { padding: 3rem; text-align: center; color: #94a3b8; }
  .apat-empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; display: block; opacity: 0.4; }

  /* Modal */
  .apat-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(15,41,66,0.55);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; padding: 2rem; backdrop-filter: blur(2px);
  }
  .apat-modal {
    background: white; border-radius: 18px;
    max-width: 760px; width: 100%; max-height: 85vh; overflow: auto;
    box-shadow: 0 24px 64px rgba(15,41,66,0.2);
  }
  .apat-modal-header {
    padding: 1.4rem 1.75rem; border-bottom: 1px solid #f1f5f9;
    display: flex; justify-content: space-between; align-items: center;
    position: sticky; top: 0; background: white; z-index: 1;
  }
  .apat-modal-title { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0; }
  .apat-modal-close {
    background: #f1f5f9; border: none; width: 32px; height: 32px;
    border-radius: 8px; display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 0.9rem; color: #64748b; transition: background 0.15s;
  }
  .apat-modal-close:hover { background: #e2e8f0; }
  .apat-modal-body { padding: 1.75rem; }

  /* Patient hero */
  .apat-patient-hero {
    display: flex; align-items: center; gap: 1rem;
    padding: 1.25rem; background: linear-gradient(135deg, #f0fdfa, #fff);
    border: 1px solid #99f6e4; border-radius: 12px; margin-bottom: 1.5rem;
  }
  .apat-patient-hero-avatar {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, #0d9488, #14b8a6);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.2rem; color: white;
    box-shadow: 0 4px 12px rgba(13,148,136,0.3);
  }

  /* Appointment history items */
  .apat-history-item {
    padding: 1rem 1.1rem; background: #f8fafc;
    border-radius: 10px; border: 1px solid #e8edf2;
    margin-bottom: 0.75rem;
    transition: border-color 0.15s;
  }
  .apat-history-item:hover { border-color: #0d9488; }
  .apat-history-item:last-child { margin-bottom: 0; }

  /* Animations */
  @keyframes apatFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .apat-fadein { animation: apatFadeUp 0.35s ease both; }
`;

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function getBadgeClass(status) {
  if (status === 'confirmed' || status === 'completed') return 'success';
  if (status === 'cancelled') return 'cancelled';
  return 'pending';
}

function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadPatients(); }, []);

  const loadPatients = async () => {
    try {
      const appointmentsRef = collection(db, 'appointments');
      const querySnapshot = await getDocs(appointmentsRef);
      const patientsMap = new Map();
      querySnapshot.forEach((doc) => {
        const appt = doc.data();
        const patientId = appt.patientId;
        if (patientId && !patientsMap.has(patientId)) {
          patientsMap.set(patientId, { id: patientId, name: appt.patientName, appointments: [] });
        }
        if (patientId) patientsMap.get(patientId).appointments.push({ id: doc.id, ...appt });
      });
      setPatients(Array.from(patientsMap.values()));
    } catch (error) { console.error('❌ Error loading patients:', error); }
    finally { setLoading(false); }
  };

  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAppointments = patients.reduce((sum, p) => sum + p.appointments.length, 0);
  const avgAppointments = patients.length > 0 ? (totalAppointments / patients.length).toFixed(1) : 0;

  if (loading) return (
    <div className="apat-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <style>{styles}</style>
      <div style={{ textAlign: 'center', color: '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>Loading patients…
      </div>
    </div>
  );

  return (
    <div className="apat-root">
      <style>{styles}</style>

      <div className="apat-header">
        <div>
          <h1>Patients</h1>
          <p>{patients.length} registered patients · {totalAppointments} total appointments</p>
        </div>
        <button className="apat-btn apat-btn-primary" onClick={loadPatients}>🔄 Refresh</button>
      </div>

      <div className="apat-content">

        {/* Stats */}
        <div className="apat-stats">
          {[
            { label: 'Total Patients',      value: patients.length,    icon: '👥', bg: '#eff6ff', color: '#2563eb' },
            { label: 'Total Appointments',  value: totalAppointments,  icon: '📋', bg: '#f0fdfa', color: '#0d9488' },
            { label: 'Avg. Appointments',   value: avgAppointments,    icon: '📊', bg: '#fdf4ff', color: '#9333ea' },
          ].map(s => (
            <div key={s.label} className="apat-stat apat-fadein">
              <div className="apat-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div>
                <div className="apat-stat-label">{s.label}</div>
                <div className="apat-stat-value">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="apat-card apat-fadein">
          <div className="apat-card-header">
            <div>
              <h2 className="apat-card-title">All Patients <span style={{ font: '400 0.8rem DM Sans,sans-serif', color: '#94a3b8' }}>({filteredPatients.length})</span></h2>
              <div className="apat-divider" />
            </div>
          </div>

          {/* Search */}
          <div style={{ padding: '1rem 1.75rem', borderBottom: '1px solid #f1f5f9' }}>
            <div className="apat-search-wrap" style={{ marginBottom: 0 }}>
              <span className="apat-search-icon">🔍</span>
              <input className="apat-search" placeholder="Search by name or patient ID…"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="apat-empty">
              <span className="apat-empty-icon">👥</span>
              <div style={{ fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                {searchTerm ? 'No patients match your search' : 'No patients yet'}
              </div>
              <div style={{ fontSize: '0.8rem' }}>Patients appear here after they book appointments</div>
            </div>
          ) : (
            <table className="apat-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Patient ID</th>
                  <th>Appointments</th>
                  <th>Last Visit</th>
                  <th>Last Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(patient => {
                  const sorted = [...patient.appointments].sort((a, b) => new Date(b.date) - new Date(a.date));
                  const last = sorted[0];
                  return (
                    <tr key={patient.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="apat-avatar">{getInitials(patient.name)}</div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{patient.name}</div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '5px', color: '#475569' }}>
                          {patient.id}
                        </span>
                      </td>
                      <td>
                        <span className="apat-badge info">{patient.appointments.length} visit{patient.appointments.length !== 1 ? 's' : ''}</span>
                      </td>
                      <td>
                        {last ? (
                          <div>
                            <div style={{ fontWeight: 500 }}>{last.date}</div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.1rem' }}>{last.appointmentType}</div>
                          </div>
                        ) : '—'}
                      </td>
                      <td>
                        {last ? <span className={`apat-badge ${getBadgeClass(last.status)}`}>{last.status || 'pending'}</span> : '—'}
                      </td>
                      <td>
                        <button className="apat-btn apat-btn-secondary apat-btn-sm" onClick={() => setSelectedPatient(patient)}>
                          👁 View History
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedPatient && (
        <div className="apat-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelectedPatient(null); }}>
          <div className="apat-modal">
            <div className="apat-modal-header">
              <h2 className="apat-modal-title">Patient History</h2>
              <button className="apat-modal-close" onClick={() => setSelectedPatient(null)}>✕</button>
            </div>
            <div className="apat-modal-body">
              {/* Patient hero */}
              <div className="apat-patient-hero">
                <div className="apat-patient-hero-avatar">{getInitials(selectedPatient.name)}</div>
                <div>
                  <div style={{ font: '700 1.1rem Syne, sans-serif', color: '#0f172a', marginBottom: '0.2rem' }}>{selectedPatient.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>ID: {selectedPatient.id}</div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="apat-badge info">{selectedPatient.appointments.length} appointment{selectedPatient.appointments.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              <div style={{ font: '700 0.9rem Syne, sans-serif', color: '#0f172a', marginBottom: '1rem' }}>
                Appointment History
              </div>

              {selectedPatient.appointments
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(appt => (
                  <div key={appt.id} className="apat-history-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>{appt.appointmentType || 'Appointment'}</div>
                      <span className={`apat-badge ${getBadgeClass(appt.status)}`}>{appt.status || 'pending'}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                      <span>📅 {appt.date}{appt.time ? ` · ${appt.time}` : ''}</span>
                      {appt.provider && <span>👨‍⚕️ {appt.provider}</span>}
                      {appt.department && <span>🏥 {appt.department}</span>}
                    </div>
                    {appt.reason && <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.35rem' }}>Reason: {appt.reason}</div>}
                  </div>
                ))}

              <div style={{ paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9', marginTop: '0.5rem' }}>
                <button className="apat-btn apat-btn-secondary" onClick={() => setSelectedPatient(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPatients;