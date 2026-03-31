import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, getDocs, query, where, orderBy, addDoc, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc as firestoreDoc, onSnapshot as firestoreOnSnapshot } from 'firebase/firestore';
import VideoCall from './VideoCall';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .amr-root {
    font-family: 'DM Sans', sans-serif;
    background: #f0f4f8;
    min-height: 100vh;
    color: #0f172a;
  }

  /* Header */
  .amr-header {
    background: linear-gradient(135deg, #0f2942 0%, #0a3d62 60%, #0d6e6e 100%);
    padding: 1.75rem 2.5rem;
    display: flex; justify-content: space-between; align-items: center;
    position: relative; overflow: hidden;
  }
  .amr-header::before {
    content: ''; position: absolute; top: -50px; right: -50px;
    width: 180px; height: 180px; border-radius: 50%;
    background: rgba(13,148,136,0.15); pointer-events: none;
  }
  .amr-header h1 { font-family: 'Syne', sans-serif; font-size: 1.75rem; font-weight: 800; color: #fff; margin: 0; letter-spacing: -0.02em; }
  .amr-header p { color: rgba(255,255,255,0.5); font-size: 0.82rem; margin: 0.2rem 0 0; }

  .amr-content { padding: 2rem 2.5rem; max-width: 1400px; }

  /* Layout */
  .amr-layout {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 1.5rem;
    margin-top: 1.75rem;
  }
  @media (max-width: 900px) { .amr-layout { grid-template-columns: 1fr; } }

  /* Card */
  .amr-card {
    background: #fff; border-radius: 16px;
    border: 1px solid #e8edf2; box-shadow: 0 1px 4px rgba(15,41,66,0.06);
    margin-bottom: 1.5rem; overflow: hidden;
  }
  .amr-card:last-child { margin-bottom: 0; }
  .amr-card-header {
    padding: 1.1rem 1.5rem; border-bottom: 1px solid #f1f5f9;
    display: flex; justify-content: space-between; align-items: center; gap: 1rem;
  }
  .amr-card-title { font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700; color: #0f172a; margin: 0; }
  .amr-card-body { padding: 1.25rem 1.5rem; }
  .amr-divider { width: 32px; height: 3px; background: linear-gradient(90deg, #0d9488, #14b8a6); border-radius: 2px; margin: 0.25rem 0 0; }

  /* Search */
  .amr-search-wrap { position: relative; margin-bottom: 1rem; }
  .amr-search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 0.9rem; }
  .amr-search {
    width: 100%; box-sizing: border-box;
    padding: 0.6rem 0.9rem 0.6rem 2.3rem;
    border: 1px solid #e2e8f0; border-radius: 9px;
    font-size: 0.85rem; font-family: 'DM Sans', sans-serif;
    color: #334155; background: #f8fafc; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .amr-search:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); background: #fff; }

  /* Patient list item */
  .amr-patient-item {
    padding: 0.9rem 1rem; border: 1px solid #e8edf2; border-radius: 10px;
    margin-bottom: 0.6rem; cursor: pointer;
    transition: all 0.15s; display: flex; align-items: center; gap: 0.75rem;
  }
  .amr-patient-item:hover { border-color: #0d9488; background: #f0fdfa; }
  .amr-patient-item.active { border-color: #0d9488; background: #f0fdfa; box-shadow: 0 0 0 2px rgba(13,148,136,0.15); }
  .amr-patient-item:last-child { margin-bottom: 0; }

  .amr-patient-avatar {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, #0d9488, #14b8a6);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.8rem; color: white;
    flex-shrink: 0; box-shadow: 0 2px 6px rgba(13,148,136,0.25);
  }

  /* Patient hero */
  .amr-patient-hero {
    padding: 1.25rem 1.5rem;
    background: linear-gradient(135deg, #f0fdfa, #fff);
    border: 1px solid #99f6e4; border-radius: 14px; margin-bottom: 1.5rem;
    display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;
    flex-wrap: wrap;
  }
  .amr-hero-left { display: flex; align-items: center; gap: 1rem; }
  .amr-hero-avatar {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, #0d9488, #14b8a6);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.2rem; color: white;
    box-shadow: 0 4px 12px rgba(13,148,136,0.3);
  }

  /* Badges */
  .amr-badge {
    display: inline-flex; align-items: center;
    padding: 0.22rem 0.6rem; border-radius: 20px;
    font-size: 0.68rem; font-weight: 700; text-transform: capitalize;
  }
  .amr-badge.success  { background: #d1fae5; color: #065f46; }
  .amr-badge.pending  { background: #fef3c7; color: #92400e; }
  .amr-badge.cancelled{ background: #fee2e2; color: #991b1b; }
  .amr-badge.completed{ background: #dbeafe; color: #1e40af; }
  .amr-badge.info     { background: #eff6ff; color: #2563eb; }

  /* Buttons */
  .amr-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.55rem 1.1rem; border-radius: 9px;
    font-size: 0.8rem; font-weight: 600; font-family: 'DM Sans', sans-serif;
    cursor: pointer; border: none; transition: all 0.18s; white-space: nowrap;
  }
  .amr-btn-primary { background: linear-gradient(135deg, #0d9488, #0f766e); color: white; box-shadow: 0 2px 8px rgba(13,148,136,0.28); }
  .amr-btn-primary:hover { box-shadow: 0 4px 16px rgba(13,148,136,0.42); transform: translateY(-1px); }
  .amr-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
  .amr-btn-secondary { background: #f1f5f9; color: #475569; }
  .amr-btn-secondary:hover { background: #e2e8f0; }
  .amr-btn-green { background: linear-gradient(135deg, #059669, #047857); color: white; box-shadow: 0 2px 8px rgba(5,150,105,0.3); }
  .amr-btn-green:hover { box-shadow: 0 4px 14px rgba(5,150,105,0.4); transform: translateY(-1px); }
  .amr-btn-sm { padding: 0.38rem 0.75rem; font-size: 0.75rem; border-radius: 7px; }

  /* Table */
  .amr-table { width: 100%; border-collapse: collapse; }
  .amr-table thead tr { background: #f8fafc; }
  .amr-table th { padding: 0.7rem 1.1rem; text-align: left; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #94a3b8; border-bottom: 1px solid #f1f5f9; }
  .amr-table td { padding: 0.8rem 1.1rem; font-size: 0.82rem; border-bottom: 1px solid #f8fafc; color: #334155; vertical-align: middle; }
  .amr-table tbody tr:last-child td { border-bottom: none; }
  .amr-table tbody tr { transition: background 0.15s; }
  .amr-table tbody tr:hover { background: #f8fafc; }

  /* Form */
  .amr-form-box {
    background: #f8fafc; border-radius: 12px; padding: 1.25rem;
    border: 1.5px solid #0d9488; margin-bottom: 1.25rem;
  }
  .amr-form-box-title { font-family: 'Syne', sans-serif; font-size: 0.9rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem; }
  .amr-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; }
  @media (max-width: 600px) { .amr-form-grid { grid-template-columns: 1fr; } }
  .amr-form-group { display: flex; flex-direction: column; gap: 0.3rem; }
  .amr-form-group.full { grid-column: 1 / -1; }
  .amr-form-label { font-size: 0.7rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
  .amr-form-input, .amr-form-textarea {
    padding: 0.55rem 0.85rem;
    border: 1px solid #e2e8f0; border-radius: 8px;
    font-size: 0.85rem; font-family: 'DM Sans', sans-serif;
    color: #334155; background: #fff; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    width: 100%; box-sizing: border-box;
  }
  .amr-form-input:focus, .amr-form-textarea:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
  .amr-form-textarea { resize: vertical; min-height: 70px; }

  /* Record cards (prescriptions / lab) */
  .amr-record-card {
    padding: 1rem 1.1rem; background: #f8fafc;
    border-radius: 10px; border: 1px solid #e8edf2; margin-bottom: 0.75rem;
    transition: border-color 0.15s;
  }
  .amr-record-card:hover { border-color: #0d9488; }
  .amr-record-card:last-child { margin-bottom: 0; }
  .amr-record-title { font-weight: 700; font-size: 0.95rem; color: #0f172a; margin-bottom: 0.4rem; }
  .amr-record-meta { font-size: 0.8rem; color: #64748b; margin-bottom: 0.25rem; }
  .amr-record-footer { font-size: 0.72rem; color: #94a3b8; margin-top: 0.6rem; padding-top: 0.6rem; border-top: 1px solid #e8edf2; }

  /* Empty */
  .amr-empty { padding: 2.5rem; text-align: center; color: #94a3b8; }
  .amr-empty-icon { font-size: 2rem; margin-bottom: 0.6rem; display: block; opacity: 0.4; }

  /* Select panel placeholder */
  .amr-placeholder {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 4rem 2rem; color: #94a3b8; text-align: center;
  }

  /* Modal */
  .amr-modal-overlay {
    position: fixed; inset: 0; background: rgba(15,41,66,0.55);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; padding: 2rem; backdrop-filter: blur(2px);
  }
  .amr-modal {
    background: white; border-radius: 18px; max-width: 580px; width: 100%;
    max-height: 85vh; overflow: auto; box-shadow: 0 24px 64px rgba(15,41,66,0.2);
  }
  .amr-modal-header {
    padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9;
    display: flex; justify-content: space-between; align-items: center;
    position: sticky; top: 0; background: white; z-index: 1;
  }
  .amr-modal-title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0; }
  .amr-modal-close { background: #f1f5f9; border: none; width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.85rem; color: #64748b; }
  .amr-modal-close:hover { background: #e2e8f0; }
  .amr-modal-body { padding: 1.5rem; }

  /* Animations */
  @keyframes amrFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .amr-fadein { animation: amrFadeUp 0.35s ease both; }
`;

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function getBadgeClass(status) {
  if (status === 'confirmed') return 'success';
  if (status === 'completed') return 'completed';
  if (status === 'cancelled') return 'cancelled';
  return 'pending';
}

const ADMIN_USER = { uid: 'admin-001', displayName: 'Admin Doctor', email: 'admin@hospital.com', role: 'doctor' };

function AdminMedicalRecords() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState({ appointments: [], prescriptions: [], labResults: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({ medication: '', dosage: '', frequency: '', duration: '', doctor: '', date: new Date().toISOString().split('T')[0] });
  const [showLabForm, setShowLabForm] = useState(false);
  const [labForm, setLabForm] = useState({ testName: '', result: '', normalRange: '', date: new Date().toISOString().split('T')[0], notes: '', imageUrl: '' });
  const [labFile, setLabFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showAppointmentNotes, setShowAppointmentNotes] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [appointmentDiagnosis, setAppointmentDiagnosis] = useState('');
  const [openCall, setOpenCall] = useState(null);
  const [activeCalls, setActiveCalls] = useState({});

  useEffect(() => { loadPatients(); }, []);

  useEffect(() => {
    const unsub = firestoreOnSnapshot(collection(db, 'calls'), (snap) => {
      const live = {};
      snap.docs.forEach(d => {
        const data = d.data();
        if (data.status === 'calling' || data.status === 'active') live[d.id] = { ...data, callDocId: d.id };
      });
      setActiveCalls(live);
    });
    return () => unsub();
  }, []);

  const loadPatients = async () => {
    try {
      const qs = await getDocs(collection(db, 'appointments'));
      const map = new Map();
      qs.forEach(d => {
        const a = d.data();
        if (a.patientId && !map.has(a.patientId)) map.set(a.patientId, { id: a.patientId, name: a.patientName, lastVisit: a.date });
      });
      setPatients(Array.from(map.values()));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadPatientRecords = async (patientId) => {
    try {
      const apptSnap = await getDocs(query(collection(db, 'appointments'), where('patientId', '==', patientId), orderBy('createdAt', 'desc')));
      const appointments = apptSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      let prescriptions = [];
      try {
        const rxSnap = await getDocs(query(collection(db, 'prescriptions'), where('patientId', '==', patientId), orderBy('createdAt', 'desc')));
        prescriptions = rxSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch { }

      let labResults = [];
      try {
        const labSnap = await getDocs(query(collection(db, 'labResults'), where('patientId', '==', patientId), orderBy('createdAt', 'desc')));
        labResults = labSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch { }

      setPatientRecords({ appointments, prescriptions, labResults });
    } catch (e) { console.error(e); }
  };

  const handleSelectPatient = (patient) => { setSelectedPatient(patient); loadPatientRecords(patient.id); };

  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPrescription = async () => {
    if (!prescriptionForm.medication || !prescriptionForm.dosage || !prescriptionForm.doctor) { alert('Please fill all required fields'); return; }
    try {
      await addDoc(collection(db, 'prescriptions'), { ...prescriptionForm, patientId: selectedPatient.id, patientName: selectedPatient.name, createdAt: Timestamp.now() });
      setPrescriptionForm({ medication: '', dosage: '', frequency: '', duration: '', doctor: '', date: new Date().toISOString().split('T')[0] });
      setShowPrescriptionForm(false);
      loadPatientRecords(selectedPatient.id);
    } catch (e) { alert('Error adding prescription.'); }
  };

  const handleAddLabResult = async () => {
    if (!labForm.testName || !labForm.result) { alert('Please fill all required fields'); return; }
    try {
      setUploadingFile(true);
      let imageUrl = '';
      if (labFile) {
        const fileRef = ref(storage, `labResults/${selectedPatient.id}/${Date.now()}_${labFile.name}`);
        await uploadBytes(fileRef, labFile);
        imageUrl = await getDownloadURL(fileRef);
      }
      await addDoc(collection(db, 'labResults'), { ...labForm, imageUrl, patientId: selectedPatient.id, patientName: selectedPatient.name, createdAt: Timestamp.now() });
      setLabForm({ testName: '', result: '', normalRange: '', date: new Date().toISOString().split('T')[0], notes: '', imageUrl: '' });
      setLabFile(null); setShowLabForm(false);
      loadPatientRecords(selectedPatient.id);
    } catch (e) { alert('Error adding lab result.'); }
    finally { setUploadingFile(false); }
  };

  const handleUpdateAppointmentNotes = async () => {
    if (!appointmentNotes && !appointmentDiagnosis) { alert('Please add notes or diagnosis'); return; }
    try {
      await updateDoc(doc(db, 'appointments', selectedAppointment.id), { notes: appointmentNotes, diagnosis: appointmentDiagnosis, updatedAt: Timestamp.now() });
      setAppointmentNotes(''); setAppointmentDiagnosis('');
      setShowAppointmentNotes(false); setSelectedAppointment(null);
      loadPatientRecords(selectedPatient.id);
    } catch (e) { alert('Error updating appointment.'); }
  };

  if (loading) return (
    <div className="amr-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <style>{styles}</style>
      <div style={{ textAlign: 'center', color: '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>Loading medical records…
      </div>
    </div>
  );

  return (
    <div className="amr-root">
      <style>{styles}</style>
      {openCall && <VideoCall appointment={openCall} currentUser={ADMIN_USER} onClose={() => setOpenCall(null)} />}

      <div className="amr-header">
        <div>
          <h1>Medical Records</h1>
          <p>Prescriptions, lab results & appointment history</p>
        </div>
        <button className="amr-btn amr-btn-primary" onClick={loadPatients}>🔄 Refresh</button>
      </div>

      <div className="amr-content">
        <div className="amr-layout">

          {/* ── Patient sidebar ── */}
          <div>
            <div className="amr-card amr-fadein">
              <div className="amr-card-header">
                <div>
                  <h2 className="amr-card-title">Patients <span style={{ font: '400 0.75rem DM Sans,sans-serif', color: '#94a3b8' }}>({filteredPatients.length})</span></h2>
                  <div className="amr-divider" />
                </div>
              </div>
              <div className="amr-card-body">
                <div className="amr-search-wrap">
                  <span className="amr-search-icon">🔍</span>
                  <input className="amr-search" placeholder="Search patients…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div style={{ maxHeight: '62vh', overflowY: 'auto', paddingRight: '2px' }}>
                  {filteredPatients.map(patient => (
                    <div key={patient.id}
                      className={`amr-patient-item ${selectedPatient?.id === patient.id ? 'active' : ''}`}
                      onClick={() => handleSelectPatient(patient)}>
                      <div className="amr-patient-avatar">{getInitials(patient.name)}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>{patient.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace', marginTop: '0.1rem' }}>{patient.id}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.1rem' }}>Last visit: {patient.lastVisit}</div>
                      </div>
                    </div>
                  ))}
                  {filteredPatients.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0', fontSize: '0.85rem' }}>No patients found</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Records panel ── */}
          <div>
            {!selectedPatient ? (
              <div className="amr-card">
                <div className="amr-placeholder">
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.3 }}>📋</div>
                  <div style={{ font: '700 1rem Syne,sans-serif', color: '#475569', marginBottom: '0.4rem' }}>Select a Patient</div>
                  <div style={{ fontSize: '0.85rem' }}>Choose a patient from the list to view their records</div>
                </div>
              </div>
            ) : (
              <>
                {/* Patient hero */}
                <div className="amr-patient-hero amr-fadein">
                  <div className="amr-hero-left">
                    <div className="amr-hero-avatar">{getInitials(selectedPatient.name)}</div>
                    <div>
                      <div style={{ font: '700 1.15rem Syne,sans-serif', color: '#0f172a', marginBottom: '0.25rem' }}>{selectedPatient.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace', marginBottom: '0.5rem' }}>ID: {selectedPatient.id}</div>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span className="amr-badge info">{patientRecords.appointments.length} visits</span>
                        <span className="amr-badge success">{patientRecords.prescriptions.length} prescriptions</span>
                        <span className="amr-badge pending">{patientRecords.labResults.length} lab results</span>
                      </div>
                    </div>
                  </div>
                  <button className="amr-btn amr-btn-green"
                    onClick={() => {
                      const appt = patientRecords.appointments.find(a => a.status !== 'completed' && a.status !== 'cancelled') || patientRecords.appointments[0];
                      setOpenCall(appt || { id: selectedPatient.id, patientName: selectedPatient.name, provider: ADMIN_USER.displayName, department: 'Medical' });
                    }}>
                    📹 Start Video Call
                  </button>
                </div>

                {/* Appointment History */}
                <div className="amr-card amr-fadein">
                  <div className="amr-card-header">
                    <div>
                      <h2 className="amr-card-title">Appointment History <span style={{ font: '400 0.75rem DM Sans,sans-serif', color: '#94a3b8' }}>({patientRecords.appointments.length})</span></h2>
                      <div className="amr-divider" />
                    </div>
                  </div>
                  {patientRecords.appointments.length === 0 ? (
                    <div className="amr-empty">
                      <span className="amr-empty-icon">📅</span>
                      <div style={{ fontWeight: 600, color: '#475569' }}>No appointments found</div>
                    </div>
                  ) : (
                    <table className="amr-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Type</th>
                          <th>Department</th>
                          <th>Provider</th>
                          <th>Status</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientRecords.appointments.map(apt => (
                          <tr key={apt.id}>
                            <td style={{ fontWeight: 500 }}>{apt.date}</td>
                            <td>{apt.time}</td>
                            <td>{apt.appointmentType}</td>
                            <td>{apt.department}</td>
                            <td>{apt.provider}</td>
                            <td><span className={`amr-badge ${getBadgeClass(apt.status)}`}>{apt.status || 'pending'}</span></td>
                            <td>
                              <button className="amr-btn amr-btn-secondary amr-btn-sm"
                                onClick={() => { setSelectedAppointment(apt); setShowAppointmentNotes(true); }}>
                                {apt.notes ? '📝 View' : '+ Notes'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Prescriptions */}
                <div className="amr-card amr-fadein">
                  <div className="amr-card-header">
                    <div>
                      <h2 className="amr-card-title">Prescriptions <span style={{ font: '400 0.75rem DM Sans,sans-serif', color: '#94a3b8' }}>({patientRecords.prescriptions.length})</span></h2>
                      <div className="amr-divider" />
                    </div>
                    <button className="amr-btn amr-btn-primary amr-btn-sm" onClick={() => setShowPrescriptionForm(!showPrescriptionForm)}>
                      {showPrescriptionForm ? '✕ Cancel' : '+ Add'}
                    </button>
                  </div>
                  <div className="amr-card-body">
                    {showPrescriptionForm && (
                      <div className="amr-form-box">
                        <div className="amr-form-box-title">💊 New Prescription</div>
                        <div className="amr-form-grid">
                          {[
                            { label: 'Medication *', key: 'medication', placeholder: 'e.g., Amoxicillin' },
                            { label: 'Dosage *', key: 'dosage', placeholder: 'e.g., 500mg' },
                            { label: 'Frequency', key: 'frequency', placeholder: 'e.g., 3x daily' },
                            { label: 'Duration', key: 'duration', placeholder: 'e.g., 7 days' },
                            { label: 'Doctor *', key: 'doctor', placeholder: 'e.g., Dr. Bhandup' },
                          ].map(f => (
                            <div key={f.key} className="amr-form-group">
                              <label className="amr-form-label">{f.label}</label>
                              <input type="text" className="amr-form-input" value={prescriptionForm[f.key]} placeholder={f.placeholder}
                                onChange={e => setPrescriptionForm({ ...prescriptionForm, [f.key]: e.target.value })} />
                            </div>
                          ))}
                          <div className="amr-form-group">
                            <label className="amr-form-label">Date</label>
                            <input type="date" className="amr-form-input" value={prescriptionForm.date}
                              onChange={e => setPrescriptionForm({ ...prescriptionForm, date: e.target.value })} />
                          </div>
                        </div>
                        <button className="amr-btn amr-btn-primary" style={{ marginTop: '1rem' }} onClick={handleAddPrescription}>💊 Save Prescription</button>
                      </div>
                    )}
                    {patientRecords.prescriptions.length === 0 && !showPrescriptionForm ? (
                      <div className="amr-empty">
                        <span className="amr-empty-icon">💊</span>
                        <div style={{ fontWeight: 600, color: '#475569' }}>No prescriptions yet</div>
                      </div>
                    ) : (
                      patientRecords.prescriptions.map(rx => (
                        <div key={rx.id} className="amr-record-card">
                          <div className="amr-record-title">{rx.medication}</div>
                          <div className="amr-record-meta"><strong>Dosage:</strong> {rx.dosage} &nbsp;·&nbsp; <strong>Frequency:</strong> {rx.frequency}</div>
                          <div className="amr-record-meta"><strong>Duration:</strong> {rx.duration}</div>
                          <div className="amr-record-footer">Prescribed by {rx.doctor} · {rx.date}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Lab Results */}
                <div className="amr-card amr-fadein">
                  <div className="amr-card-header">
                    <div>
                      <h2 className="amr-card-title">Lab Results <span style={{ font: '400 0.75rem DM Sans,sans-serif', color: '#94a3b8' }}>({patientRecords.labResults.length})</span></h2>
                      <div className="amr-divider" />
                    </div>
                    <button className="amr-btn amr-btn-primary amr-btn-sm" onClick={() => setShowLabForm(!showLabForm)}>
                      {showLabForm ? '✕ Cancel' : '+ Add'}
                    </button>
                  </div>
                  <div className="amr-card-body">
                    {showLabForm && (
                      <div className="amr-form-box">
                        <div className="amr-form-box-title">🧪 New Lab Result</div>
                        <div className="amr-form-grid">
                          {[
                            { label: 'Test Name *', key: 'testName', placeholder: 'e.g., Complete Blood Count' },
                            { label: 'Result *', key: 'result', placeholder: 'e.g., Normal' },
                            { label: 'Normal Range', key: 'normalRange', placeholder: 'e.g., 4.5–11.0' },
                          ].map(f => (
                            <div key={f.key} className="amr-form-group">
                              <label className="amr-form-label">{f.label}</label>
                              <input type="text" className="amr-form-input" value={labForm[f.key]} placeholder={f.placeholder}
                                onChange={e => setLabForm({ ...labForm, [f.key]: e.target.value })} />
                            </div>
                          ))}
                          <div className="amr-form-group">
                            <label className="amr-form-label">Date</label>
                            <input type="date" className="amr-form-input" value={labForm.date}
                              onChange={e => setLabForm({ ...labForm, date: e.target.value })} />
                          </div>
                          <div className="amr-form-group full">
                            <label className="amr-form-label">Upload Scan / Report (optional)</label>
                            <input type="file" className="amr-form-input" accept="image/*,.pdf"
                              onChange={e => setLabFile(e.target.files[0])} style={{ padding: '0.4rem' }} />
                            {labFile && <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '0.25rem' }}>✅ {labFile.name}</div>}
                          </div>
                          <div className="amr-form-group full">
                            <label className="amr-form-label">Notes</label>
                            <textarea className="amr-form-textarea" rows={2} placeholder="Additional notes…" value={labForm.notes}
                              onChange={e => setLabForm({ ...labForm, notes: e.target.value })} />
                          </div>
                        </div>
                        <button className="amr-btn amr-btn-primary" style={{ marginTop: '1rem' }} onClick={handleAddLabResult} disabled={uploadingFile}>
                          {uploadingFile ? '⏳ Uploading…' : '🧪 Save Lab Result'}
                        </button>
                      </div>
                    )}
                    {patientRecords.labResults.length === 0 && !showLabForm ? (
                      <div className="amr-empty">
                        <span className="amr-empty-icon">🧪</span>
                        <div style={{ fontWeight: 600, color: '#475569' }}>No lab results yet</div>
                      </div>
                    ) : (
                      patientRecords.labResults.map(result => (
                        <div key={result.id} className="amr-record-card">
                          <div className="amr-record-title">{result.testName}</div>
                          <div className="amr-record-meta"><strong>Result:</strong> {result.result}</div>
                          {result.normalRange && <div className="amr-record-meta"><strong>Normal Range:</strong> {result.normalRange}</div>}
                          {result.notes && <div className="amr-record-meta"><strong>Notes:</strong> {result.notes}</div>}
                          {result.imageUrl && (
                            <a href={result.imageUrl} target="_blank" rel="noopener noreferrer"
                              className="amr-btn amr-btn-secondary amr-btn-sm" style={{ marginTop: '0.6rem', display: 'inline-flex' }}>
                              📄 View Report
                            </a>
                          )}
                          <div className="amr-record-footer">Test date: {result.date}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Appointment Notes Modal */}
      {showAppointmentNotes && selectedAppointment && (
        <div className="amr-modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowAppointmentNotes(false); setSelectedAppointment(null); } }}>
          <div className="amr-modal">
            <div className="amr-modal-header">
              <h2 className="amr-modal-title">{selectedAppointment.notes ? 'View / Edit Notes' : 'Add Notes'}</h2>
              <button className="amr-modal-close" onClick={() => { setShowAppointmentNotes(false); setSelectedAppointment(null); setAppointmentNotes(''); setAppointmentDiagnosis(''); }}>✕</button>
            </div>
            <div className="amr-modal-body">
              <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#64748b', border: '1px solid #e8edf2' }}>
                <div><strong>Appointment:</strong> {selectedAppointment.appointmentType}</div>
                <div><strong>Date:</strong> {selectedAppointment.date} at {selectedAppointment.time}</div>
                <div><strong>Provider:</strong> {selectedAppointment.provider}</div>
              </div>
              <div className="amr-form-group" style={{ marginBottom: '1rem' }}>
                <label className="amr-form-label">Diagnosis</label>
                <input type="text" className="amr-form-input" placeholder="e.g., Upper Respiratory Infection"
                  value={appointmentDiagnosis || selectedAppointment.diagnosis || ''}
                  onChange={e => setAppointmentDiagnosis(e.target.value)} />
              </div>
              <div className="amr-form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="amr-form-label">Visit Notes</label>
                <textarea className="amr-form-textarea" rows={5} placeholder="Add notes about this visit…"
                  value={appointmentNotes || selectedAppointment.notes || ''}
                  onChange={e => setAppointmentNotes(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="amr-btn amr-btn-primary" onClick={handleUpdateAppointmentNotes}>💾 Save Notes</button>
                <button className="amr-btn amr-btn-secondary" onClick={() => { setShowAppointmentNotes(false); setSelectedAppointment(null); setAppointmentNotes(''); setAppointmentDiagnosis(''); }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMedicalRecords;