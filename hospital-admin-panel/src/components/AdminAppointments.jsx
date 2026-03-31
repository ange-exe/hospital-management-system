import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, getDoc, addDoc, where, Timestamp } from 'firebase/firestore';
import { Html5QrcodeScanner } from 'html5-qrcode';

function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');
  const scannerRef = useRef(null);
const [showBookForm, setShowBookForm] = useState(false);
const [bookForm, setBookForm] = useState({
  patientName: '',
  patientId: '',
  department: '',
  provider: '',
  date: '',
  time: '',
  reasonForVisit: '',
  symptoms: '',
  vehicleSupport: '',   // 👈 add this
  preferredContact: 'email'
});
const [isBooking, setIsBooking] = useState(false);
const [bookSuccess, setBookSuccess] = useState(false);
const [slotAvailability, setSlotAvailability] = useState({});
const [showBillForm, setShowBillForm] = useState(false);
const [billItems, setBillItems] = useState([{ name: '', qty: 1, amount: '' }]);
const [pendingCompleteId, setPendingCompleteId] = useState(null);
const [pendingCompleteData, setPendingCompleteData] = useState(null);
const departments = [
  'General Medicine', 'Pediatrics', 'Cardiology', 'Dermatology',
  'Orthopedics', 'Mental Health', 'Gynecology', 'Dental'
];

const allDoctors = {
  'Cardiology': ['Dr. Bhandup', 'Dr. Dadar'],
  'General Medicine': ['Dr. Thane', 'Dr. Kurla', 'Nurse Chinnapandyan Iyer'],
  'Pediatrics': ['Dr. Andheri', 'Dr. Sion'],
  'Orthopedics': ['Dr. Lower Parel', 'Dr. Madh'],
  'Mental Health': ['Dr. Parel', 'Dr. Goregaon'],
  'Dermatology': ['Dr. Ghatkopar', 'Dr. Matunga Road'],
  'Gynecology': ['Dr. Matunga', 'Dr. Wadala'],
  'Dental': ['Dr. Diva', 'Dr. Nahur']
};

const timeSlots = [
  ['09:00', '9:00 AM'], ['09:30', '9:30 AM'], ['10:00', '10:00 AM'],
  ['10:30', '10:30 AM'], ['11:00', '11:00 AM'], ['11:30', '11:30 AM'],
  ['13:00', '1:00 PM'], ['13:30', '1:30 PM'], ['14:00', '2:00 PM'],
  ['14:30', '2:30 PM'], ['15:00', '3:00 PM'], ['15:30', '3:30 PM'],
  ['16:00', '4:00 PM']
];
  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, statusFilter, dateFilter, departmentFilter]);

  useEffect(() => {
    if (scanning) {
      const scanner = new Html5QrcodeScanner('qr-reader', {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  rememberLastUsedCamera: true,
  videoConstraints: {
    facingMode: { ideal: "environment" }
  }
});
      scanner.render(
        async (scannedData) => {
          try {
            console.log('📱 Scanned data:', scannedData);
            
            let appointmentId;
            try {
              const parsed = JSON.parse(scannedData);
              appointmentId = parsed.appointmentId;
            } catch {
              appointmentId = scannedData.trim();
            }
            
            console.log('🔍 Looking for appointment ID:', appointmentId);
            
            // Always fetch directly from Firebase
            const appointmentRef = doc(db, 'appointments', appointmentId);
            const appointmentSnap = await getDoc(appointmentRef);
            
            if (appointmentSnap.exists()) {
              const apptData = appointmentSnap.data();
              setScanResult({
                appointmentId: appointmentSnap.id,
                patientName: apptData.patientName,
                patientId: apptData.patientId,
                token: apptData.tokenNumber,
                date: apptData.date,
                time: apptData.time,
                department: apptData.department,
                provider: apptData.provider,
                status: apptData.status
              });
              setScanning(false);
              setScanError('');
            } else {
              setScanError('Appointment not found! ID: ' + appointmentId);
            }
          } catch (error) {
            console.error('❌ Scan processing error:', error);
            setScanError('Error processing QR code. Try again.');
          }
        },
        (err) => {
          console.error('Scan error:', err);
        }
      );
      scannerRef.current = scanner;
    } else {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [scanning]);

  const markAsCompleted = async () => {
  if (!pendingCompleteId || !pendingCompleteData) return;
  const validItems = billItems.filter(i => i.name && i.amount);
  if (validItems.length === 0) {
    alert('Please add at least one bill item.');
    return;
  }
  try {
    const appointmentRef = doc(db, 'appointments', pendingCompleteId);
    await updateDoc(appointmentRef, { status: 'completed', completedAt: Timestamp.now() });

    await addDoc(collection(db, 'receipts'), {
      appointmentId: pendingCompleteId,
      patientId: pendingCompleteData.patientId,
      patientName: pendingCompleteData.patientName,
      department: pendingCompleteData.department,
      provider: pendingCompleteData.provider,
      visitDate: pendingCompleteData.date,
      receiptNumber: 'RCP-' + pendingCompleteData.date?.replace(/-/g, '') + '-' + Date.now().toString().slice(-3),
      reasonForVisit: pendingCompleteData.reasonForVisit || 'General Visit',
      tokenNumber: pendingCompleteData.token || pendingCompleteData.tokenNumber || '',
      items: validItems.map(i => ({ name: i.name, qty: Number(i.qty), amount: Number(i.amount) })),
      paymentStatus: 'unpaid',
      paid: false,
      createdAt: Timestamp.now()
    });

    setScanResult(prev => ({ ...prev, status: 'completed' }));
    setShowBillForm(false);
    setBillItems([{ name: '', qty: 1, amount: '' }]);
    setPendingCompleteId(null);
    setPendingCompleteData(null);
    loadAppointments();
  } catch (error) {
    console.error(error);
    setScanError('Failed to update. Try again.');
  }
};

const markAsPaid = async (appointmentId) => {
  try {
    const receiptsRef = collection(db, 'receipts');
    const q = query(receiptsRef, where('appointmentId', '==', appointmentId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      await updateDoc(doc(db, 'receipts', snapshot.docs[0].id), {
        paid: true,
        paymentStatus: 'paid',
        paidAt: Timestamp.now()
      });
    }
    await updateDoc(doc(db, 'appointments', appointmentId), {
      paymentStatus: 'paid'
    });
    setScanResult(prev => ({ ...prev, paid: true }));
    loadAppointments(); 
  } catch (error) {
    setScanError('Failed to mark as paid. Try again.');
  }
};

  const loadAppointments = async () => {
    try {
      const appointmentsRef = collection(db, 'appointments');
      const q = query(appointmentsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const appointmentsList = [];
      querySnapshot.forEach((doc) => {
        appointmentsList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setAppointments(appointmentsList);
      console.log(' Loaded appointments:', appointmentsList.length);
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Filter by department
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(apt => apt.department === departmentFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => (apt.status || 'pending') === statusFilter);
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter(apt => apt.date === dateFilter);
    }

    setFilteredAppointments(filtered);
  };

  const checkSlotAvailability = async (date, time) => {
  try {
    const q = query(collection(db, 'appointments'), where('date', '==', date), where('time', '==', time));
    const snapshot = await getDocs(q);
    return Math.max(0, 5 - snapshot.size);
  } catch (error) {
    return 5;
  }
};

const loadSlotAvailability = async (date) => {
  const slots = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00'];
  const availability = {};
  for (const time of slots) {
    availability[time] = await checkSlotAvailability(date, time);
  }
  setSlotAvailability(availability);
};

const handlePatientIdChange = async (e) => {
  const patientId = e.target.value;
  setBookForm(prev => ({ ...prev, patientId }));
  if (!patientId || patientId.length < 5) return;
  try {
    const snapshot = await getDocs(query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId)
    ));
    if (!snapshot.empty) {
      const name = snapshot.docs[0].data().patientName;
      setBookForm(prev => ({ ...prev, patientId, patientName: name }));
    }
  } catch (error) {
    console.error('Autofill error:', error);
  }
};

  const handleBookForPatient = async (e) => {
  e.preventDefault();
  const isUrgentAdmin = bookForm.reasonForVisit === 'URGENT CARE';
if (!bookForm.patientName || !bookForm.patientId || !bookForm.reasonForVisit) {
  alert('Please fill all required fields.');
  return;
}
if (!isUrgentAdmin && (!bookForm.department || !bookForm.date || !bookForm.time)) {
  alert('Please fill all required fields.');
  return;
}
  setIsBooking(true);
  try {
    const tokenNumber = Date.now().toString().slice(-4);
    await addDoc(collection(db, 'appointments'), {
      ...bookForm,
      status: 'confirmed',
      isUrgent: isUrgentAdmin,                                    // 👈 add
  date: isUrgentAdmin ? 'ASAP' : bookForm.date,              // 👈 add
  time: isUrgentAdmin ? 'ASAP' : bookForm.time,
      tokenNumber,
      bookedByAdmin: true,
      createdAt: Timestamp.now()
    });
    setBookSuccess(true);
    setBookForm({
      patientName: '', patientId: '', department: '', provider: '',
      date: '', time: '', reasonForVisit: '', symptoms: '', preferredContact: 'email'
    });
    setTimeout(() => { setBookSuccess(false); setShowBookForm(false); }, 3000);
    loadAppointments();
  } catch (error) {
    alert('Error booking appointment. Please try again.');
  } finally {
    setIsBooking(false);
  }
};

  const handleApprove = async (appointmentId) => {
    if (!confirm('Approve this appointment?')) return;

    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status: 'confirmed'
      });
      
      alert(' Appointment approved!');
      loadAppointments();
    } catch (error) {
      console.error('Error approving appointment:', error);
      alert('Error approving appointment. Please try again.');
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!confirm('Cancel this appointment? This action cannot be undone.')) return;

    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status: 'cancelled'
      });
      
      alert(' Appointment cancelled!');
      loadAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Error cancelling appointment. Please try again.');
    }
  };

  const handleDelete = async (appointmentId) => {
    if (!confirm('Delete this appointment permanently? This action cannot be undone.')) return;

    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await deleteDoc(appointmentRef);
      
      alert(' Appointment deleted!');
      loadAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Error deleting appointment. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading appointments...</div>;
  }

  return (
    <div className="fade-in">
      <div className="admin-header">
        <h1>Appointments Management</h1>
        <div className="admin-header-actions">
          <button className="btn btn-primary" onClick={loadAppointments}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="admin-content">
        {/* Book Appointment for Patient */}
<div className="admin-card" style={{ marginBottom: '2rem' }}>
  <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <h2 className="admin-card-title"> Book Appointment for Patient</h2>
    <button className="btn btn-primary" onClick={() => { setShowBookForm(!showBookForm); setBookSuccess(false); }}>
      {showBookForm ? '✕ Close' : '+ Book Appointment'}
    </button>
  </div>

  {bookSuccess && (
    <div style={{ margin: '1rem 1.5rem', padding: '1rem', background: '#d1fae5', borderRadius: '8px', color: '#065f46', fontWeight: '600' }}>
       Appointment booked! Status set to Confirmed.
    </div>
  )}

  {showBookForm && (
    <div style={{ padding: '1.5rem' }}>
      <form onSubmit={handleBookForPatient}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Reason for Visit *</label>
            <select className="form-select" value={bookForm.reasonForVisit} required
              onChange={(e) => setBookForm({ ...bookForm, reasonForVisit: e.target.value })}>
              <option value="">Select reason</option>
              {['URGENT CARE', 'General Checkup', 'Follow-up', 'Vaccination', 'Other'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          {bookForm.reasonForVisit === 'URGENT CARE' && (
  <>
    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
      <label className="form-label">Symptoms *</label>
      <textarea className="form-textarea" rows="3"
        placeholder="Describe patient symptoms..."
        value={bookForm.symptoms}
        onChange={(e) => setBookForm({ ...bookForm, symptoms: e.target.value })}
        required
      />
    </div>
    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
      <label className="form-label">Vehicle / Ambulance Support?</label>
      <div style={{ display: 'flex', gap: '2rem', paddingTop: '0.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '400' }}>
          <input type="radio" name="adminVehicleSupport" value="yes"
            checked={bookForm.vehicleSupport === 'yes'}
            onChange={(e) => setBookForm({ ...bookForm, vehicleSupport: e.target.value })}
            style={{ width: 'auto' }} />
          Yes 🚗
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '400' }}>
          <input type="radio" name="adminVehicleSupport" value="no"
            checked={bookForm.vehicleSupport === 'no'}
            onChange={(e) => setBookForm({ ...bookForm, vehicleSupport: e.target.value })}
            style={{ width: 'auto' }} />
          No
        </label>
      </div>
    </div>
  </>
)}
          <div className="form-group">
            <label className="form-label">Patient Name *</label>
            <input type="text" className="form-input" placeholder="e.g., Raju Rastogi"
              value={bookForm.patientName}
              onChange={(e) => setBookForm({ ...bookForm, patientName: e.target.value })} required />
          </div>
          <div className="form-group">
  <label className="form-label">Patient ID *</label>
  <input type="text" className="form-input" placeholder="e.g., STU-2024-1847"
    value={bookForm.patientId}
    onChange={handlePatientIdChange} required />
</div>
{bookForm.reasonForVisit !== 'URGENT CARE' && (
<>
          <div className="form-group">
            <label className="form-label">Department *</label>
            <select className="form-select" value={bookForm.department} required
              onChange={(e) => setBookForm({ ...bookForm, department: e.target.value, provider: '' })}>
              <option value="">Select department</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          </>
)}
          <div className="form-group">
            <label className="form-label">Provider</label>
            <select className="form-select" value={bookForm.provider} disabled={!bookForm.department}
              onChange={(e) => setBookForm({ ...bookForm, provider: e.target.value })}>
              <option value="">{bookForm.department ? 'Select provider (optional)' : 'Select department first'}</option>
              {(allDoctors[bookForm.department] || []).map(d => <option key={d} value={d}>{d}</option>)}
              <option value="Any Available Provider">Any Available Provider</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input type="date" className="form-input" value={bookForm.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => { setBookForm({ ...bookForm, date: e.target.value }); loadSlotAvailability(e.target.value); }} required />
          </div>
          <div className="form-group">
            <label className="form-label">Time *</label>
            <select className="form-select" value={bookForm.time} required
              onChange={(e) => setBookForm({ ...bookForm, time: e.target.value })}>
              <option value="">Select time slot</option>
              {timeSlots.map(([val, label]) => (
  <option key={val} value={val} disabled={slotAvailability[val] === 0}>
    {label} {bookForm.date && `(${slotAvailability[val] !== undefined ? slotAvailability[val] : 5} slots left)`}
  </option>
))}
            </select>
          </div>
          
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Symptoms / Notes</label>
            <textarea className="form-textarea" rows="3" placeholder="Additional notes..."
              value={bookForm.symptoms}
              onChange={(e) => setBookForm({ ...bookForm, symptoms: e.target.value })} />
          </div>
        </div>
        <div style={{ padding: '0.75rem 1rem', background: '#eff6ff', borderRadius: '8px', fontSize: '0.875rem', color: '#1d4ed8', marginBottom: '1rem' }}>
          ℹ️ Appointments booked by admin are automatically set to <strong>Confirmed</strong>.
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isBooking}>
          {isBooking ? ' Booking...' : ' Book Appointment'}
        </button>
      </form>
    </div>
  )}

  {!showBookForm && !bookSuccess && (
    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>
      Use this to book an appointment on behalf of a patient (walk-in, phone booking, etc.)
    </div>
  )}
</div>
      {/* QR Scanner Section */}
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="admin-card-title">📷 Scan Patient QR Code</h2>
            <button
              className="btn btn-primary"
              onClick={() => { setScanning(!scanning); setScanResult(null); setScanError(''); }}
            >
              {scanning ? '⏹ Stop Scanner' : '📷 Start Scanner'}
            </button>
          </div>

          {scanning && (
            <div style={{ padding: '1rem', textAlign: 'center' }}>
              <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                Point your camera at the patient's QR code
              </p>
              <div id="qr-reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }} />
            </div>
          )}

          {scanError && (
            <div style={{ padding: '1rem', color: '#ef4444', textAlign: 'center' }}>
              ⚠️ {scanError}
            </div>
          )}

          {scanResult && (
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#10b981' }}> Patient Scanned!</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div><strong>Patient:</strong> {scanResult.patientName}</div>
                <div><strong>Token:</strong> #{scanResult.token}</div>
                <div><strong>Date:</strong> {scanResult.date}</div>
                <div><strong>Time:</strong> {scanResult.time}</div>
                <div><strong>Department:</strong> {scanResult.department}</div>
                <div><strong>Doctor:</strong> {scanResult.provider}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
  {scanResult.status !== 'completed' && !showBillForm && (
    <button
      onClick={() => {
        setPendingCompleteId(scanResult.appointmentId);
        setPendingCompleteData(scanResult);
        setShowBillForm(true);
      }}
      className="btn btn-primary"
      style={{ width: '100%', background: '#059669', border: 'none' }}
    >
      ✓ Mark as Completed + Create Bill
    </button>
  )}

  {showBillForm && (
    <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
      <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>🧾 Bill Items</h4>

      {billItems.map((item, index) => (
        <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 0.5fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Item name"
            className="form-input"
            value={item.name}
            onChange={(e) => {
              const updated = [...billItems];
              updated[index].name = e.target.value;
              setBillItems(updated);
            }}
          />
          <input
            type="number"
            placeholder="Qty"
            className="form-input"
            min="1"
            value={item.qty}
            onChange={(e) => {
              const updated = [...billItems];
              updated[index].qty = e.target.value;
              setBillItems(updated);
            }}
          />
          <input
            type="number"
            placeholder="₹ Amount"
            className="form-input"
            value={item.amount}
            onChange={(e) => {
              const updated = [...billItems];
              updated[index].amount = e.target.value;
              setBillItems(updated);
            }}
          />
          <button
            onClick={() => setBillItems(billItems.filter((_, i) => i !== index))}
            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem' }}
          >✕</button>
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
        <button
          onClick={() => setBillItems([...billItems, { name: '', qty: 1, amount: '' }])}
          className="btn btn-secondary"
          style={{ fontSize: '0.85rem' }}
        >
          + Add Item
        </button>
        <strong style={{ color: '#1e293b' }}>
          Total: ₹{billItems.reduce((sum, i) => sum + (Number(i.amount) * Number(i.qty) || 0), 0).toLocaleString()}
        </strong>
      </div>

      <button
        onClick={markAsCompleted}
        className="btn btn-primary"
        style={{ width: '100%', marginTop: '1rem', background: '#059669', border: 'none' }}
      >
        ✓ Confirm & Save Bill
      </button>
    </div>
  )}

  {scanResult.status === 'completed' && (
    <div style={{ padding: '1rem', background: '#d1fae5', borderRadius: '8px', color: '#065f46', fontWeight: '600', textAlign: 'center' }}>
      ✓ Completed!
    </div>
  )}

  {scanResult.status === 'completed' && !scanResult.paid && (
    <button
      onClick={() => markAsPaid(scanResult.appointmentId)}
      className="btn btn-primary"
      style={{ width: '100%', background: '#0ea5e9', border: 'none' }}
    >
      💳 Mark as Paid
    </button>
  )}

  {scanResult.paid && (
    <div style={{ padding: '1rem', background: '#e0f2fe', borderRadius: '8px', color: '#0369a1', fontWeight: '600', textAlign: 'center' }}>
      ✅ Payment Received!
    </div>
  )}
</div>
            </div>
          )}

          {!scanning && !scanResult && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              Click "Start Scanner" to scan a patient's QR code
            </div>
          )}
        </div>
        {/* Filters */}
        <div className="filters">
          <div className="filter-item">
            <label className="form-label">🔍 Search by Department</label>
            <select 
              className="form-select"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{ fontWeight: '600' }}
            >
              <option value="all">All Departments</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Mental Health">Mental Health</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Gynecology">Gynecology</option>
              <option value="Dental">Dental</option>
            </select>
          </div>

          <div className="filter-item">
            <label className="form-label">Filter by Status</label>
            <select 
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-item">
            <label className="form-label">Filter by Date</label>
            <input
              type="date"
              className="form-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          {(departmentFilter !== 'all' || statusFilter !== 'all' || dateFilter) && (
            <div className="filter-item" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setDepartmentFilter('all');
                  setStatusFilter('all');
                  setDateFilter('');
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-card-title">Total</div>
            <div className="stat-card-value">{appointments.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-title">Pending</div>
            <div className="stat-card-value" style={{ color: '#f59e0b' }}>
              {appointments.filter(a => (a.status || 'pending') === 'pending').length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-title">Confirmed</div>
            <div className="stat-card-value" style={{ color: '#10b981' }}>
              {appointments.filter(a => a.status === 'confirmed').length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-title">Cancelled</div>
            <div className="stat-card-value" style={{ color: '#ef4444' }}>
              {appointments.filter(a => a.status === 'cancelled').length}
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              Appointments ({filteredAppointments.length})
            </h2>
          </div>
          <div className="admin-card-body" style={{ padding: 0 }}>
            {filteredAppointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <h3 className="empty-state-title">No appointments found</h3>
                <p className="empty-state-text">
                  {statusFilter !== 'all' || dateFilter 
                    ? 'Try adjusting your filters' 
                    : 'New appointments will appear here'}
                </p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Type</th>
                    <th>Doctor</th>
                    <th>Department</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{appointment.patientName || 'N/A'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {appointment.patientId || ''}
                        </div>
                      </td>
                      <td>{appointment.appointmentType}</td>
                      <td>{appointment.provider}</td>
                      <td>{appointment.department}</td>
                      <td>{appointment.date}</td>
                      <td>{appointment.time}</td>
                      <td>
                        <span className={`badge badge-${
  appointment.status === 'confirmed' ? 'success' :
  appointment.status === 'completed' ? 'success' :
  appointment.status === 'cancelled' ? 'cancelled' :
  'pending'
}`}>
  {appointment.status || 'pending'}
</span>
{appointment.paymentStatus === 'paid' && (
  <span className="badge badge-success" style={{ marginLeft: '0.4rem' }}>
    Paid
  </span>
)}
                      </td>
                      <td>
                        <div className="table-actions">
                          {(!appointment.status || appointment.status === 'pending') && (
                            <button 
                              className="btn btn-success"
                              onClick={() => handleApprove(appointment.id)}
                              title="Approve"
                            >
                              ✓
                            </button>
                          )}
                          {appointment.status !== 'cancelled' && (
                            <button 
                              className="btn btn-danger"
                              onClick={() => handleCancel(appointment.id)}
                              title="Cancel"
                            >
                              ✕
                            </button>
                          )}
                          <button 
                            className="btn btn-secondary"
                            onClick={() => setSelectedAppointment(appointment)}
                            title="View Details"
                          >
                            👁️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Appointment Details Modal */}
        {selectedAppointment && (
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
              maxWidth: '600px',
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
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Appointment Details</h2>
                <button 
                  onClick={() => setSelectedAppointment(null)}
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
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                    PATIENT
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                    {selectedAppointment.patientName}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    ID: {selectedAppointment.patientId}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      TYPE
                    </div>
                    <div style={{ fontWeight: 600 }}>{selectedAppointment.appointmentType}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      DEPARTMENT
                    </div>
                    <div style={{ fontWeight: 600 }}>{selectedAppointment.department}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      DOCTOR
                    </div>
                    <div style={{ fontWeight: 600 }}>{selectedAppointment.provider}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      STATUS
                    </div>
                    <span className={`badge badge-${
                      selectedAppointment.status === 'confirmed' ? 'success' : 
                      selectedAppointment.status === 'cancelled' ? 'cancelled' : 
                      'pending'
                    }`}>
                      {selectedAppointment.status || 'pending'}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      DATE
                    </div>
                    <div style={{ fontWeight: 600 }}>{selectedAppointment.date}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      TIME
                    </div>
                    <div style={{ fontWeight: 600 }}>{selectedAppointment.time}</div>
                  </div>
                </div>

                {selectedAppointment.reason && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      REASON FOR VISIT
                    </div>
                    <div>{selectedAppointment.reason}</div>
                  </div>
                )}

{selectedAppointment.isUrgent && (
  <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
    <span style={{ padding: '0.35rem 0.75rem', background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem' }}>
      🚨 URGENT CARE
    </span>
    {selectedAppointment.vehicleSupport === 'yes' && (
      <span style={{ padding: '0.35rem 0.75rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #93c5fd', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem' }}>
        🚗 Vehicle Support Requested
      </span>
    )}
  </div>
)}
                {selectedAppointment.symptoms && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      SYMPTOMS
                    </div>
                    <div>{selectedAppointment.symptoms}</div>
                  </div>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                    PREFERRED CONTACT
                  </div>
                  <div style={{ textTransform: 'capitalize' }}>
                    {selectedAppointment.preferredContact || 'Email'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
  <CallButton appointment={selectedAppointment} />
  {(!selectedAppointment.status || selectedAppointment.status === 'pending') && (
    <button 
      className="btn btn-success"
                      onClick={() => {
                        handleApprove(selectedAppointment.id);
                        setSelectedAppointment(null);
                      }}
                    >
                      Approve Appointment
                    </button>
                  )}
                  {selectedAppointment.status !== 'cancelled' && (
                    <button 
                      className="btn btn-danger"
                      onClick={() => {
                        handleCancel(selectedAppointment.id);
                        setSelectedAppointment(null);
                      }}
                    >
                      Cancel Appointment
                    </button>
                  )}
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setSelectedAppointment(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAppointments;
