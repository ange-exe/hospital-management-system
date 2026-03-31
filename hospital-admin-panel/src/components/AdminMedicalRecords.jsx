import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, getDocs, query, where, orderBy, addDoc, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc as firestoreDoc, onSnapshot as firestoreOnSnapshot } from 'firebase/firestore';
import VideoCall from './VideoCall';

function AdminMedicalRecords() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState({
    appointments: [],
    prescriptions: [],
    labResults: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    doctor: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [showLabForm, setShowLabForm] = useState(false);
  const [labForm, setLabForm] = useState({
    testName: '',
    result: '',
    normalRange: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    imageUrl: ''
  });
  const [labFile, setLabFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showAppointmentNotes, setShowAppointmentNotes] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [appointmentDiagnosis, setAppointmentDiagnosis] = useState('');
  const [openCall, setOpenCall] = useState(null);
  const [activeCalls, setActiveCalls] = useState({});

  const ADMIN_USER = {
    uid: 'admin-001',
    displayName: 'Admin Doctor',
    email: 'admin@hospital.com',
    role: 'doctor',
  };

  useEffect(() => {
    loadPatients();
  }, []);

useEffect(() => {
    const unsub = firestoreOnSnapshot(collection(db, 'calls'), (snap) => {
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
  }, []);

  const loadPatients = async () => {
    try {
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
            lastVisit: appointment.date
          });
        }
      });
      const patientsList = Array.from(patientsMap.values());
      setPatients(patientsList);
    } catch (error) {
      console.error('❌ Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientRecords = async (patientId) => {
    try {
      const appointmentsRef = collection(db, 'appointments');
      const appointmentsQuery = query(
        appointmentsRef,
        where('patientId', '==', patientId),
        orderBy('createdAt', 'desc')
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointments = [];
      appointmentsSnapshot.forEach((doc) => {
        appointments.push({ id: doc.id, ...doc.data() });
      });

      let prescriptions = [];
      try {
        const prescriptionsRef = collection(db, 'prescriptions');
        const prescriptionsQuery = query(
          prescriptionsRef,
          where('patientId', '==', patientId),
          orderBy('createdAt', 'desc')
        );
        const prescriptionsSnapshot = await getDocs(prescriptionsQuery);
        prescriptionsSnapshot.forEach((doc) => {
          prescriptions.push({ id: doc.id, ...doc.data() });
        });
      } catch (err) {
        console.log('No prescriptions collection yet');
      }

      let labResults = [];
      try {
        const labResultsRef = collection(db, 'labResults');
        const labResultsQuery = query(
          labResultsRef,
          where('patientId', '==', patientId),
          orderBy('createdAt', 'desc')
        );
        const labResultsSnapshot = await getDocs(labResultsQuery);
        labResultsSnapshot.forEach((doc) => {
          labResults.push({ id: doc.id, ...doc.data() });
        });
      } catch (err) {
        console.log('No lab results collection yet');
      }

      setPatientRecords({ appointments, prescriptions, labResults });
    } catch (error) {
      console.error('❌ Error loading patient records:', error);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    loadPatientRecords(patient.id);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPrescription = async () => {
    if (!prescriptionForm.medication || !prescriptionForm.dosage || !prescriptionForm.doctor) {
      alert('Please fill all required fields');
      return;
    }
    try {
      const prescriptionsRef = collection(db, 'prescriptions');
      await addDoc(prescriptionsRef, {
        ...prescriptionForm,
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        createdAt: Timestamp.now()
      });
      alert('✅ Prescription added successfully!');
      setPrescriptionForm({
        medication: '', dosage: '', frequency: '',
        duration: '', doctor: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowPrescriptionForm(false);
      loadPatientRecords(selectedPatient.id);
    } catch (error) {
      console.error('Error adding prescription:', error);
      alert('Error adding prescription. Please try again.');
    }
  };

  const handleAddLabResult = async () => {
    if (!labForm.testName || !labForm.result) {
      alert('Please fill all required fields');
      return;
    }
    try {
      setUploadingFile(true);
      let imageUrl = '';
      if (labFile) {
        const fileRef = ref(storage, `labResults/${selectedPatient.id}/${Date.now()}_${labFile.name}`);
        await uploadBytes(fileRef, labFile);
        imageUrl = await getDownloadURL(fileRef);
      }
      const labResultsRef = collection(db, 'labResults');
      await addDoc(labResultsRef, {
        ...labForm,
        imageUrl,
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        createdAt: Timestamp.now()
      });
      alert('✅ Lab result added successfully!');
      setLabForm({
        testName: '', result: '', normalRange: '',
        date: new Date().toISOString().split('T')[0],
        notes: '', imageUrl: ''
      });
      setLabFile(null);
      setShowLabForm(false);
      loadPatientRecords(selectedPatient.id);
    } catch (error) {
      console.error('Error adding lab result:', error);
      alert('Error adding lab result. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleUpdateAppointmentNotes = async () => {
    if (!appointmentNotes && !appointmentDiagnosis) {
      alert('Please add notes or diagnosis');
      return;
    }
    try {
      const appointmentRef = doc(db, 'appointments', selectedAppointment.id);
      await updateDoc(appointmentRef, {
        notes: appointmentNotes,
        diagnosis: appointmentDiagnosis,
        updatedAt: Timestamp.now()
      });
      alert('✅ Appointment updated successfully!');
      setAppointmentNotes('');
      setAppointmentDiagnosis('');
      setShowAppointmentNotes(false);
      setSelectedAppointment(null);
      loadPatientRecords(selectedPatient.id);
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Error updating appointment. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading medical records...</div>;
  }

  return (
    <div className="fade-in">
      {openCall && (
        <VideoCall
          appointment={openCall}
          currentUser={ADMIN_USER}
          onClose={() => setOpenCall(null)}
        />
      )}
      <div className="admin-header">
        <h1>Medical Records</h1>
        <div className="admin-header-actions">
          <button className="btn btn-primary" onClick={loadPatients}>🔄 Refresh</button>
        </div>
      </div>

      <div className="admin-content">
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>

          {/* Patient List */}
          <div>
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">Patients ({patients.length})</h2>
              </div>
              <div className="admin-card-body">
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => handleSelectPatient(patient)}
                      style={{
                        padding: '1rem',
                        background: selectedPatient?.id === patient.id ? '#e0f2fe' : 'white',
                        border: selectedPatient?.id === patient.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        marginBottom: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{patient.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {patient.id}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Last Visit: {patient.lastVisit}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Patient Records */}
          <div>
            {!selectedPatient ? (
              <div className="admin-card">
                <div className="admin-card-body">
                  <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <h3 className="empty-state-title">Select a Patient</h3>
                    <p className="empty-state-text">Choose a patient from the list to view their medical records</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Patient Info Header */}
                <div className="admin-card" style={{ marginBottom: '2rem' }}>
                  <div className="admin-card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{selectedPatient.name}</h2>
                        <div style={{ color: '#64748b' }}>
                          <div>Patient ID: {selectedPatient.id}</div>
                          <div>Last Visit: {selectedPatient.lastVisit}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <span className="badge badge-info">{patientRecords.appointments.length} Visits</span>
                          <span className="badge badge-success">{patientRecords.prescriptions.length} Prescriptions</span>
                          <span className="badge badge-pending">{patientRecords.labResults.length} Lab Results</span>
                        </div>
                        <button
                          onClick={() => {
                            const appt = patientRecords.appointments.find(
                              a => a.status !== 'completed' && a.status !== 'cancelled'
                            ) || patientRecords.appointments[0];
                            setOpenCall(appt || { id: selectedPatient.id, patientName: selectedPatient.name, provider: ADMIN_USER.displayName, department: 'Medical' });
                          }}
                          style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #059669, #047857)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 12px rgba(5,150,105,0.4)',
                          }}
                        >
                          📹 Start Video Call
                        </button>
                      </div>
                    </div>
                  </div>
                  
                </div>

                {/* Appointments History */}
                <div className="admin-card" style={{ marginBottom: '2rem' }}>
                  <div className="admin-card-header">
                    <h2 className="admin-card-title">Appointment History ({patientRecords.appointments.length})</h2>
                  </div>
                  <div className="admin-card-body" style={{ padding: 0 }}>
                    {patientRecords.appointments.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">📅</div>
                        <h3 className="empty-state-title">No appointments found</h3>
                      </div>
                    ) : (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Type</th>
                            <th>Department</th>
                            <th>Provider</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {patientRecords.appointments.map((apt) => (
                            <tr key={apt.id}>
                              <td>{apt.date}</td>
                              <td>{apt.time}</td>
                              <td>{apt.appointmentType}</td>
                              <td>{apt.department}</td>
                              <td>{apt.provider}</td>
                              <td>
                                <span className={`badge badge-${
                                  apt.status === 'confirmed' ? 'success' :
                                  apt.status === 'completed' ? 'success' :
                                  apt.status === 'cancelled' ? 'cancelled' :
                                  'pending'
                                }`}>
                                  {apt.status || 'pending'}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="btn btn-secondary"
                                  onClick={() => {
                                    setSelectedAppointment(apt);
                                    setShowAppointmentNotes(true);
                                  }}
                                  style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
                                >
                                  {apt.notes ? '📝 View Notes' : '+ Add Notes'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Prescriptions */}
                <div className="admin-card" style={{ marginBottom: '2rem' }}>
                  <div className="admin-card-header">
                    <h2 className="admin-card-title">Prescriptions ({patientRecords.prescriptions.length})</h2>
                    <button className="btn btn-primary" onClick={() => setShowPrescriptionForm(!showPrescriptionForm)}>
                      {showPrescriptionForm ? '✕ Cancel' : '+ Add Prescription'}
                    </button>
                  </div>
                  <div className="admin-card-body">
                    {showPrescriptionForm && (
                      <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '1.5rem', border: '2px solid #3b82f6' }}>
                        <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>New Prescription</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div className="form-group">
                            <label className="form-label">Medication *</label>
                            <input type="text" className="form-input" value={prescriptionForm.medication} onChange={(e) => setPrescriptionForm({...prescriptionForm, medication: e.target.value})} placeholder="e.g., Amoxicillin" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Dosage *</label>
                            <input type="text" className="form-input" value={prescriptionForm.dosage} onChange={(e) => setPrescriptionForm({...prescriptionForm, dosage: e.target.value})} placeholder="e.g., 500mg" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Frequency *</label>
                            <input type="text" className="form-input" value={prescriptionForm.frequency} onChange={(e) => setPrescriptionForm({...prescriptionForm, frequency: e.target.value})} placeholder="e.g., 3 times daily" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Duration *</label>
                            <input type="text" className="form-input" value={prescriptionForm.duration} onChange={(e) => setPrescriptionForm({...prescriptionForm, duration: e.target.value})} placeholder="e.g., 7 days" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Doctor *</label>
                            <input type="text" className="form-input" value={prescriptionForm.doctor} onChange={(e) => setPrescriptionForm({...prescriptionForm, doctor: e.target.value})} placeholder="e.g., Dr. Bhandup" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Date *</label>
                            <input type="date" className="form-input" value={prescriptionForm.date} onChange={(e) => setPrescriptionForm({...prescriptionForm, date: e.target.value})} />
                          </div>
                        </div>
                        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleAddPrescription}>
                          💊 Save Prescription
                        </button>
                      </div>
                    )}

                    {patientRecords.prescriptions.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">💊</div>
                        <h3 className="empty-state-title">No prescriptions yet</h3>
                        <p className="empty-state-text">Click "Add Prescription" to create one</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {patientRecords.prescriptions.map((prescription) => (
                          <div key={prescription.id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '1.1rem' }}>{prescription.medication}</div>
                            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                              <strong>Dosage:</strong> {prescription.dosage} | <strong>Frequency:</strong> {prescription.frequency}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                              <strong>Duration:</strong> {prescription.duration}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                              Prescribed by {prescription.doctor} on {prescription.date}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Lab Results */}
                <div className="admin-card">
                  <div className="admin-card-header">
                    <h2 className="admin-card-title">Lab Results ({patientRecords.labResults.length})</h2>
                    <button className="btn btn-primary" onClick={() => setShowLabForm(!showLabForm)}>
                      {showLabForm ? '✕ Cancel' : '+ Add Lab Result'}
                    </button>
                  </div>
                  <div className="admin-card-body">
                    {showLabForm && (
                      <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '1.5rem', border: '2px solid #3b82f6' }}>
                        <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>New Lab Result</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div className="form-group">
                            <label className="form-label">Test Name *</label>
                            <input type="text" className="form-input" value={labForm.testName} onChange={(e) => setLabForm({...labForm, testName: e.target.value})} placeholder="e.g., Complete Blood Count" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Result *</label>
                            <input type="text" className="form-input" value={labForm.result} onChange={(e) => setLabForm({...labForm, result: e.target.value})} placeholder="e.g., Normal" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Normal Range</label>
                            <input type="text" className="form-input" value={labForm.normalRange} onChange={(e) => setLabForm({...labForm, normalRange: e.target.value})} placeholder="e.g., 4.5-11.0 x10^9/L" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Date *</label>
                            <input type="date" className="form-input" value={labForm.date} onChange={(e) => setLabForm({...labForm, date: e.target.value})} />
                          </div>
                          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">Upload Scan/Image/Report (optional)</label>
                            <input
                              type="file"
                              className="form-input"
                              accept="image/*,.pdf"
                              onChange={(e) => setLabFile(e.target.files[0])}
                              style={{ padding: '0.5rem' }}
                            />
                            {labFile && (
                              <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>
                                ✅ Selected: {labFile.name}
                              </div>
                            )}
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                              Accepts images and PDF files (X-rays, scans, reports etc.)
                            </div>
                          </div>
                          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">Notes</label>
                            <textarea className="form-textarea" value={labForm.notes} onChange={(e) => setLabForm({...labForm, notes: e.target.value})} placeholder="Additional notes..." rows="2" />
                          </div>
                        </div>
                        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleAddLabResult} disabled={uploadingFile}>
                          {uploadingFile ? '⏳ Uploading...' : '🧪 Save Lab Result'}
                        </button>
                      </div>
                    )}

                    {patientRecords.labResults.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">🧪</div>
                        <h3 className="empty-state-title">No lab results yet</h3>
                        <p className="empty-state-text">Click "Add Lab Result" to create one</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {patientRecords.labResults.map((result) => (
                          <div key={result.id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '1.1rem' }}>{result.testName}</div>
                            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                              <strong>Result:</strong> {result.result}
                            </div>
                            {result.normalRange && (
                              <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                <strong>Normal Range:</strong> {result.normalRange}
                              </div>
                            )}
                            {result.notes && (
                              <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                <strong>Notes:</strong> {result.notes}
                              </div>
                            )}
                            {result.imageUrl && (
                              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                                <a href={result.imageUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                                  📄 View Scan/Report
                                </a>
                              </div>
                            )}
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                              Test Date: {result.date}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Appointment Notes Modal */}
        {showAppointmentNotes && selectedAppointment && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
            <div style={{ background: 'white', borderRadius: '12px', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  {selectedAppointment.notes ? 'View/Edit Notes' : 'Add Notes'}
                </h2>
                <button onClick={() => { setShowAppointmentNotes(false); setSelectedAppointment(null); setAppointmentNotes(''); setAppointmentDiagnosis(''); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>
              <div style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}><strong>Appointment:</strong> {selectedAppointment.appointmentType}</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}><strong>Date:</strong> {selectedAppointment.date} at {selectedAppointment.time}</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}><strong>Provider:</strong> {selectedAppointment.provider}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Diagnosis</label>
                  <input type="text" className="form-input" value={appointmentDiagnosis || selectedAppointment.diagnosis || ''} onChange={(e) => setAppointmentDiagnosis(e.target.value)} placeholder="e.g., Upper Respiratory Infection" />
                </div>
                <div className="form-group">
                  <label className="form-label">Visit Notes</label>
                  <textarea className="form-textarea" value={appointmentNotes || selectedAppointment.notes || ''} onChange={(e) => setAppointmentNotes(e.target.value)} placeholder="Add notes about this visit..." rows="5" />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button className="btn btn-primary" onClick={handleUpdateAppointmentNotes}>💾 Save Notes</button>
                  <button className="btn btn-secondary" onClick={() => { setShowAppointmentNotes(false); setSelectedAppointment(null); setAppointmentNotes(''); setAppointmentDiagnosis(''); }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminMedicalRecords;