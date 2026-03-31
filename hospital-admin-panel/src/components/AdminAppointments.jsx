import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, getDoc, addDoc, where, Timestamp } from 'firebase/firestore';
import { Html5QrcodeScanner } from 'html5-qrcode';

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .aappt-root {
    font-family: 'DM Sans', sans-serif;
    background: #f0f4f8;
    min-height: 100vh;
    color: #0f172a;
  }

  /* ── Header ── */
  .aappt-header {
    background: linear-gradient(135deg, #0f2942 0%, #0a3d62 60%, #0d6e6e 100%);
    padding: 1.75rem 2.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: hidden;
  }

  .aappt-header::before {
    content: '';
    position: absolute;
    top: -50px; right: -50px;
    width: 180px; height: 180px;
    border-radius: 50%;
    background: rgba(13,148,136,0.15);
    pointer-events: none;
  }

  .aappt-header h1 {
    font-family: 'Syne', sans-serif;
    font-size: 1.75rem;
    font-weight: 800;
    color: #fff;
    margin: 0;
    letter-spacing: -0.02em;
  }

  .aappt-header p {
    color: rgba(255,255,255,0.5);
    font-size: 0.82rem;
    margin: 0.2rem 0 0;
  }

  /* ── Content ── */
  .aappt-content {
    padding: 2rem 2.5rem;
    max-width: 1400px;
  }

  /* ── Card ── */
  .aappt-card {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e8edf2;
    box-shadow: 0 1px 4px rgba(15,41,66,0.06);
    margin-bottom: 1.5rem;
    overflow: hidden;
  }

  .aappt-card-header {
    padding: 1.25rem 1.75rem;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .aappt-card-title {
    font-family: 'Syne', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }

  .aappt-card-body { padding: 1.5rem 1.75rem; }

  /* ── Buttons ── */
  .aappt-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.55rem 1.2rem;
    border-radius: 9px;
    font-size: 0.82rem;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    border: none;
    transition: all 0.18s;
    white-space: nowrap;
  }

  .aappt-btn-primary {
    background: linear-gradient(135deg, #0d9488, #0f766e);
    color: white;
    box-shadow: 0 2px 8px rgba(13,148,136,0.28);
  }
  .aappt-btn-primary:hover { box-shadow: 0 4px 16px rgba(13,148,136,0.42); transform: translateY(-1px); }
  .aappt-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

  .aappt-btn-secondary {
    background: #f1f5f9;
    color: #475569;
  }
  .aappt-btn-secondary:hover { background: #e2e8f0; }

  .aappt-btn-success {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    box-shadow: 0 2px 8px rgba(16,185,129,0.28);
  }
  .aappt-btn-success:hover { box-shadow: 0 4px 14px rgba(16,185,129,0.38); transform: translateY(-1px); }

  .aappt-btn-danger {
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }
  .aappt-btn-danger:hover { background: #fee2e2; }

  .aappt-btn-icon {
    padding: 0.45rem 0.65rem;
    border-radius: 8px;
    font-size: 0.85rem;
    background: #f8fafc;
    color: #475569;
    border: 1px solid #e2e8f0;
  }
  .aappt-btn-icon:hover { background: #f1f5f9; }

  .aappt-btn-sm {
    padding: 0.38rem 0.75rem;
    font-size: 0.75rem;
    border-radius: 7px;
  }

  /* ── Stat chips ── */
  .aappt-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  @media (max-width: 900px) { .aappt-stats { grid-template-columns: repeat(2,1fr); } }

  .aappt-stat {
    background: #fff;
    border-radius: 14px;
    padding: 1.25rem 1.4rem;
    border: 1px solid #e8edf2;
    box-shadow: 0 1px 3px rgba(15,41,66,0.05);
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .aappt-stat-icon {
    width: 42px; height: 42px;
    border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .aappt-stat-label {
    font-size: 0.72rem;
    font-weight: 500;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.2rem;
  }

  .aappt-stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 1.6rem;
    font-weight: 800;
    line-height: 1;
    color: #0f172a;
  }

  /* ── Filters ── */
  .aappt-filters {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    align-items: flex-end;
    margin-bottom: 1.5rem;
    background: #fff;
    border: 1px solid #e8edf2;
    border-radius: 14px;
    padding: 1.25rem 1.5rem;
    box-shadow: 0 1px 3px rgba(15,41,66,0.05);
  }

  .aappt-filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    flex: 1;
    min-width: 140px;
  }

  .aappt-filter-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .aappt-select, .aappt-input {
    padding: 0.55rem 0.85rem;
    border: 1px solid #e2e8f0;
    border-radius: 9px;
    font-size: 0.85rem;
    font-family: 'DM Sans', sans-serif;
    color: #334155;
    background: #f8fafc;
    transition: border-color 0.15s, box-shadow 0.15s;
    outline: none;
  }
  .aappt-select:focus, .aappt-input:focus {
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13,148,136,0.1);
    background: #fff;
  }

  /* ── Table ── */
  .aappt-table { width: 100%; border-collapse: collapse; }

  .aappt-table thead tr { background: #f8fafc; }

  .aappt-table th {
    padding: 0.75rem 1.25rem;
    text-align: left;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #94a3b8;
    border-bottom: 1px solid #f1f5f9;
  }

  .aappt-table td {
    padding: 0.85rem 1.25rem;
    font-size: 0.85rem;
    border-bottom: 1px solid #f8fafc;
    color: #334155;
    vertical-align: middle;
  }

  .aappt-table tbody tr:last-child td { border-bottom: none; }
  .aappt-table tbody tr { transition: background 0.15s; }
  .aappt-table tbody tr:hover { background: #f8fafc; }

  .aappt-table-actions { display: flex; gap: 0.4rem; align-items: center; }

  /* ── Badge ── */
  .aappt-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.22rem 0.6rem;
    border-radius: 20px;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: capitalize;
    letter-spacing: 0.03em;
  }
  .aappt-badge.confirmed  { background: #d1fae5; color: #065f46; }
  .aappt-badge.completed  { background: #dbeafe; color: #1e40af; }
  .aappt-badge.pending    { background: #fef3c7; color: #92400e; }
  .aappt-badge.cancelled  { background: #fee2e2; color: #991b1b; }
  .aappt-badge.paid       { background: #dcfce7; color: #166534; }
  .aappt-badge.urgent     { background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; }

  /* ── Form ── */
  .aappt-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  @media (max-width: 600px) { .aappt-form-grid { grid-template-columns: 1fr; } }

  .aappt-form-group { display: flex; flex-direction: column; gap: 0.35rem; }
  .aappt-form-group.full { grid-column: 1 / -1; }

  .aappt-form-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .aappt-form-input, .aappt-form-select, .aappt-form-textarea {
    padding: 0.6rem 0.9rem;
    border: 1px solid #e2e8f0;
    border-radius: 9px;
    font-size: 0.875rem;
    font-family: 'DM Sans', sans-serif;
    color: #334155;
    background: #f8fafc;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    width: 100%;
    box-sizing: border-box;
  }

  .aappt-form-input:focus, .aappt-form-select:focus, .aappt-form-textarea:focus {
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13,148,136,0.1);
    background: #fff;
  }

  .aappt-form-textarea { resize: vertical; min-height: 80px; }

  /* ── Info box ── */
  .aappt-info-box {
    padding: 0.75rem 1rem;
    border-radius: 9px;
    font-size: 0.82rem;
    font-weight: 500;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .aappt-info-box.blue   { background: #eff6ff; color: #1d4ed8; }
  .aappt-info-box.green  { background: #d1fae5; color: #065f46; }
  .aappt-info-box.red    { background: #fef2f2; color: #dc2626; }

  /* ── QR scanner area ── */
  .aappt-scan-placeholder {
    padding: 2.5rem;
    text-align: center;
    color: #94a3b8;
  }

  .aappt-scan-result {
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    padding: 1.25rem 1.5rem;
    margin-top: 0.5rem;
  }

  .aappt-result-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }

  .aappt-result-item label {
    display: block;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #94a3b8;
    margin-bottom: 0.15rem;
  }

  .aappt-result-item span {
    font-size: 0.875rem;
    font-weight: 600;
    color: #0f172a;
  }

  /* ── Bill form ── */
  .aappt-bill-row {
    display: grid;
    grid-template-columns: 2fr 0.5fr 1fr auto;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .aappt-remove-btn {
    background: none;
    border: none;
    color: #ef4444;
    cursor: pointer;
    font-size: 1rem;
    padding: 0.4rem;
    border-radius: 6px;
    transition: background 0.15s;
  }
  .aappt-remove-btn:hover { background: #fef2f2; }

  /* ── Modal ── */
  .aappt-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15,41,66,0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 2rem;
    backdrop-filter: blur(2px);
  }

  .aappt-modal {
    background: white;
    border-radius: 18px;
    max-width: 600px;
    width: 100%;
    max-height: 85vh;
    overflow: auto;
    box-shadow: 0 24px 64px rgba(15,41,66,0.2);
  }

  .aappt-modal-header {
    padding: 1.4rem 1.75rem;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    background: white;
    z-index: 1;
  }

  .aappt-modal-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }

  .aappt-modal-close {
    background: #f1f5f9;
    border: none;
    width: 32px; height: 32px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    font-size: 0.9rem;
    color: #64748b;
    transition: background 0.15s;
  }
  .aappt-modal-close:hover { background: #e2e8f0; }

  .aappt-modal-body { padding: 1.75rem; }

  .aappt-modal-field { margin-bottom: 1.25rem; }
  .aappt-modal-field-label {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #94a3b8;
    margin-bottom: 0.25rem;
  }
  .aappt-modal-field-value {
    font-size: 0.95rem;
    font-weight: 600;
    color: #0f172a;
  }
  .aappt-modal-field-sub {
    font-size: 0.8rem;
    color: #64748b;
    margin-top: 0.1rem;
  }

  .aappt-modal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
    margin-bottom: 1.25rem;
  }

  .aappt-modal-footer {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    padding-top: 1.25rem;
    border-top: 1px solid #f1f5f9;
  }

  /* ── Divider ── */
  .aappt-divider {
    width: 36px; height: 3px;
    background: linear-gradient(90deg, #0d9488, #14b8a6);
    border-radius: 2px;
    margin: 0.3rem 0 0;
  }

  /* ── Empty state ── */
  .aappt-empty {
    padding: 3rem;
    text-align: center;
    color: #94a3b8;
  }

  .aappt-empty-icon {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
    display: block;
    opacity: 0.45;
  }

  /* ── Radio group ── */
  .aappt-radio-group {
    display: flex;
    gap: 1.5rem;
    padding-top: 0.4rem;
  }

  .aappt-radio-label {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.875rem;
    color: #334155;
    cursor: pointer;
  }

  /* ── Slot badge ── */
  .slot-ok   { color: #059669; }
  .slot-low  { color: #d97706; }
  .slot-full { color: #dc2626; }

  /* ── Animations ── */
  @keyframes aapptFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .aappt-fadein { animation: aapptFadeUp 0.35s ease both; }
`;

/* ─── Helpers ─────────────────────────────────────────── */
function getBadgeClass(status) {
  if (status === 'confirmed') return 'confirmed';
  if (status === 'completed') return 'completed';
  if (status === 'cancelled') return 'cancelled';
  return 'pending';
}

function SlotLabel({ slots }) {
  if (slots === undefined) return null;
  if (slots === 0) return <span className="slot-full"> · Full</span>;
  if (slots <= 2) return <span className="slot-low"> · {slots} left</span>;
  return <span className="slot-ok"> · {slots} left</span>;
}

/* ─── Constants ───────────────────────────────────────── */
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

/* ─── Component ───────────────────────────────────────── */
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
    patientName: '', patientId: '', department: '', provider: '',
    date: '', time: '', reasonForVisit: '', symptoms: '',
    vehicleSupport: '', preferredContact: 'email'
  });
  const [isBooking, setIsBooking] = useState(false);
  const [bookSuccess, setBookSuccess] = useState(false);
  const [slotAvailability, setSlotAvailability] = useState({});
  const [showBillForm, setShowBillForm] = useState(false);
  const [billItems, setBillItems] = useState([{ name: '', qty: 1, amount: '' }]);
  const [pendingCompleteId, setPendingCompleteId] = useState(null);
  const [pendingCompleteData, setPendingCompleteData] = useState(null);

  useEffect(() => { loadAppointments(); }, []);
  useEffect(() => { filterAppointments(); }, [appointments, statusFilter, dateFilter, departmentFilter]);

  useEffect(() => {
    if (scanning) {
      const scanner = new Html5QrcodeScanner('qr-reader', {
        fps: 10, qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        videoConstraints: { facingMode: { ideal: 'environment' } }
      });
      scanner.render(
        async (scannedData) => {
          try {
            let appointmentId;
            try { const parsed = JSON.parse(scannedData); appointmentId = parsed.appointmentId; }
            catch { appointmentId = scannedData.trim(); }
            const appointmentRef = doc(db, 'appointments', appointmentId);
            const appointmentSnap = await getDoc(appointmentRef);
            if (appointmentSnap.exists()) {
              const apptData = appointmentSnap.data();
              setScanResult({
                appointmentId: appointmentSnap.id,
                patientName: apptData.patientName,
                patientId: apptData.patientId,
                token: apptData.tokenNumber,
                date: apptData.date, time: apptData.time,
                department: apptData.department, provider: apptData.provider,
                status: apptData.status
              });
              setScanning(false); setScanError('');
            } else {
              setScanError('Appointment not found! ID: ' + appointmentId);
            }
          } catch (error) { setScanError('Error processing QR code. Try again.'); }
        },
        (err) => console.error('Scan error:', err)
      );
      scannerRef.current = scanner;
    } else {
      if (scannerRef.current) { scannerRef.current.clear().catch(() => {}); scannerRef.current = null; }
    }
    return () => { if (scannerRef.current) { scannerRef.current.clear().catch(() => {}); } };
  }, [scanning]);

  const markAsCompleted = async () => {
    if (!pendingCompleteId || !pendingCompleteData) return;
    const validItems = billItems.filter(i => i.name && i.amount);
    if (validItems.length === 0) { alert('Please add at least one bill item.'); return; }
    try {
      await updateDoc(doc(db, 'appointments', pendingCompleteId), { status: 'completed', completedAt: Timestamp.now() });
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
        paymentStatus: 'unpaid', paid: false, createdAt: Timestamp.now()
      });
      setScanResult(prev => ({ ...prev, status: 'completed' }));
      setShowBillForm(false);
      setBillItems([{ name: '', qty: 1, amount: '' }]);
      setPendingCompleteId(null); setPendingCompleteData(null);
      loadAppointments();
    } catch (error) { setScanError('Failed to update. Try again.'); }
  };

  const markAsPaid = async (appointmentId) => {
    try {
      const q = query(collection(db, 'receipts'), where('appointmentId', '==', appointmentId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        await updateDoc(doc(db, 'receipts', snapshot.docs[0].id), { paid: true, paymentStatus: 'paid', paidAt: Timestamp.now() });
      }
      await updateDoc(doc(db, 'appointments', appointmentId), { paymentStatus: 'paid' });
      setScanResult(prev => ({ ...prev, paid: true }));
      loadAppointments();
    } catch { setScanError('Failed to mark as paid. Try again.'); }
  };

  const loadAppointments = async () => {
    try {
      const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
      setAppointments(list);
    } catch (error) { console.error('❌ Error loading appointments:', error); }
    finally { setLoading(false); }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];
    if (departmentFilter !== 'all') filtered = filtered.filter(a => a.department === departmentFilter);
    if (statusFilter !== 'all') filtered = filtered.filter(a => (a.status || 'pending') === statusFilter);
    if (dateFilter) filtered = filtered.filter(a => a.date === dateFilter);
    setFilteredAppointments(filtered);
  };

  const checkSlotAvailability = async (date, time) => {
    try {
      const q = query(collection(db, 'appointments'), where('date', '==', date), where('time', '==', time));
      const snap = await getDocs(q);
      return Math.max(0, 5 - snap.size);
    } catch { return 5; }
  };

  const loadSlotAvailability = async (date) => {
    const slots = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00'];
    const avail = {};
    for (const t of slots) avail[t] = await checkSlotAvailability(date, t);
    setSlotAvailability(avail);
  };

  const handlePatientIdChange = async (e) => {
    const patientId = e.target.value;
    setBookForm(prev => ({ ...prev, patientId }));
    if (!patientId || patientId.length < 5) return;
    try {
      const snap = await getDocs(query(collection(db, 'appointments'), where('patientId', '==', patientId)));
      if (!snap.empty) {
        const name = snap.docs[0].data().patientName;
        setBookForm(prev => ({ ...prev, patientId, patientName: name }));
      }
    } catch { }
  };

  const handleBookForPatient = async (e) => {
    e.preventDefault();
    const isUrgentAdmin = bookForm.reasonForVisit === 'URGENT CARE';
    if (!bookForm.patientName || !bookForm.patientId || !bookForm.reasonForVisit) { alert('Please fill all required fields.'); return; }
    if (!isUrgentAdmin && (!bookForm.department || !bookForm.date || !bookForm.time)) { alert('Please fill all required fields.'); return; }
    setIsBooking(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        ...bookForm, status: 'confirmed',
        isUrgent: isUrgentAdmin,
        date: isUrgentAdmin ? 'ASAP' : bookForm.date,
        time: isUrgentAdmin ? 'ASAP' : bookForm.time,
        tokenNumber: Date.now().toString().slice(-4),
        bookedByAdmin: true, createdAt: Timestamp.now()
      });
      setBookSuccess(true);
      setBookForm({ patientName: '', patientId: '', department: '', provider: '', date: '', time: '', reasonForVisit: '', symptoms: '', preferredContact: 'email' });
      setTimeout(() => { setBookSuccess(false); setShowBookForm(false); }, 3000);
      loadAppointments();
    } catch { alert('Error booking appointment. Please try again.'); }
    finally { setIsBooking(false); }
  };

  const handleApprove = async (appointmentId) => {
    if (!confirm('Approve this appointment?')) return;
    try { await updateDoc(doc(db, 'appointments', appointmentId), { status: 'confirmed' }); loadAppointments(); }
    catch { alert('Error approving.'); }
  };

  const handleCancel = async (appointmentId) => {
    if (!confirm('Cancel this appointment? This cannot be undone.')) return;
    try { await updateDoc(doc(db, 'appointments', appointmentId), { status: 'cancelled' }); loadAppointments(); }
    catch { alert('Error cancelling.'); }
  };

  const handleDelete = async (appointmentId) => {
    if (!confirm('Delete permanently?')) return;
    try { await deleteDoc(doc(db, 'appointments', appointmentId)); loadAppointments(); }
    catch { alert('Error deleting.'); }
  };

  if (loading) {
    return (
      <div className="aappt-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <style>{styles}</style>
        <div style={{ textAlign: 'center', color: '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          Loading appointments…
        </div>
      </div>
    );
  }

  const isUrgent = bookForm.reasonForVisit === 'URGENT CARE';
  const billTotal = billItems.reduce((sum, i) => sum + (Number(i.amount) * Number(i.qty) || 0), 0);

  return (
    <div className="aappt-root">
      <style>{styles}</style>

      {/* ── Header ── */}
      <div className="aappt-header">
        <div>
          <h1>Appointments</h1>
          <p>Manage, scan & track all patient appointments</p>
        </div>
        <button className="aappt-btn aappt-btn-secondary" onClick={loadAppointments}>
          🔄 Refresh
        </button>
      </div>

      <div className="aappt-content">

        {/* ── Stats ── */}
        <div className="aappt-stats" style={{ marginTop: '1.75rem' }}>
          {[
            { label: 'Total', value: appointments.length, color: '#3b82f6', bg: '#eff6ff', icon: '📋' },
            { label: 'Pending', value: appointments.filter(a => (a.status||'pending') === 'pending').length, color: '#f59e0b', bg: '#fffbeb', icon: '⏳' },
            { label: 'Confirmed', value: appointments.filter(a => a.status === 'confirmed').length, color: '#10b981', bg: '#ecfdf5', icon: '✓' },
            { label: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, color: '#ef4444', bg: '#fef2f2', icon: '✕' },
          ].map(s => (
            <div key={s.label} className="aappt-stat aappt-fadein">
              <div className="aappt-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div>
                <div className="aappt-stat-label">{s.label}</div>
                <div className="aappt-stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Book Appointment ── */}
        <div className="aappt-card aappt-fadein">
          <div className="aappt-card-header">
            <div>
              <h2 className="aappt-card-title">Book Appointment for Patient</h2>
              <div className="aappt-divider" />
            </div>
            <button className="aappt-btn aappt-btn-primary" onClick={() => { setShowBookForm(!showBookForm); setBookSuccess(false); }}>
              {showBookForm ? '✕ Close' : '+ Book Appointment'}
            </button>
          </div>

          {bookSuccess && (
            <div className="aappt-card-body" style={{ paddingTop: 0 }}>
              <div className="aappt-info-box green">✅ Appointment booked! Status set to Confirmed.</div>
            </div>
          )}

          {showBookForm && (
            <div className="aappt-card-body">
              <form onSubmit={handleBookForPatient}>
                <div className="aappt-form-grid">
                  {/* Reason */}
                  <div className="aappt-form-group full">
                    <label className="aappt-form-label">Reason for Visit *</label>
                    <select className="aappt-form-select" value={bookForm.reasonForVisit} required
                      onChange={e => setBookForm({ ...bookForm, reasonForVisit: e.target.value })}>
                      <option value="">Select reason</option>
                      {['URGENT CARE','General Checkup','Follow-up','Vaccination','Other'].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  {/* Urgent extras */}
                  {isUrgent && (
                    <>
                      <div className="aappt-form-group full">
                        <label className="aappt-form-label">Symptoms *</label>
                        <textarea className="aappt-form-textarea" rows={3} placeholder="Describe patient symptoms..."
                          value={bookForm.symptoms} required
                          onChange={e => setBookForm({ ...bookForm, symptoms: e.target.value })} />
                      </div>
                      <div className="aappt-form-group full">
                        <label className="aappt-form-label">Vehicle / Ambulance Support?</label>
                        <div className="aappt-radio-group">
                          {['yes','no'].map(v => (
                            <label key={v} className="aappt-radio-label">
                              <input type="radio" name="adminVehicleSupport" value={v}
                                checked={bookForm.vehicleSupport === v}
                                onChange={e => setBookForm({ ...bookForm, vehicleSupport: e.target.value })}
                                style={{ width: 'auto' }} />
                              {v === 'yes' ? 'Yes 🚗' : 'No'}
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="aappt-form-group">
                    <label className="aappt-form-label">Patient Name *</label>
                    <input className="aappt-form-input" type="text" placeholder="e.g., Raju Rastogi"
                      value={bookForm.patientName} required
                      onChange={e => setBookForm({ ...bookForm, patientName: e.target.value })} />
                  </div>

                  <div className="aappt-form-group">
                    <label className="aappt-form-label">Patient ID *</label>
                    <input className="aappt-form-input" type="text" placeholder="e.g., STU-2024-1847"
                      value={bookForm.patientId} required onChange={handlePatientIdChange} />
                  </div>

                  {!isUrgent && (
                    <div className="aappt-form-group">
                      <label className="aappt-form-label">Department *</label>
                      <select className="aappt-form-select" value={bookForm.department} required
                        onChange={e => setBookForm({ ...bookForm, department: e.target.value, provider: '' })}>
                        <option value="">Select department</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="aappt-form-group">
                    <label className="aappt-form-label">Provider</label>
                    <select className="aappt-form-select" value={bookForm.provider} disabled={!bookForm.department}
                      onChange={e => setBookForm({ ...bookForm, provider: e.target.value })}>
                      <option value="">{bookForm.department ? 'Select provider (optional)' : 'Select department first'}</option>
                      {(allDoctors[bookForm.department] || []).map(d => <option key={d} value={d}>{d}</option>)}
                      <option value="Any Available Provider">Any Available Provider</option>
                    </select>
                  </div>

                  {!isUrgent && (
                    <>
                      <div className="aappt-form-group">
                        <label className="aappt-form-label">Date *</label>
                        <input className="aappt-form-input" type="date" value={bookForm.date} required
                          min={new Date().toISOString().split('T')[0]}
                          onChange={e => { setBookForm({ ...bookForm, date: e.target.value }); loadSlotAvailability(e.target.value); }} />
                      </div>
                      <div className="aappt-form-group">
                        <label className="aappt-form-label">Time *</label>
                        <select className="aappt-form-select" value={bookForm.time} required
                          onChange={e => setBookForm({ ...bookForm, time: e.target.value })}>
                          <option value="">Select time slot</option>
                          {timeSlots.map(([val, label]) => (
                            <option key={val} value={val} disabled={slotAvailability[val] === 0}>
                              {label}{bookForm.date && ` (${slotAvailability[val] !== undefined ? slotAvailability[val] : 5} left)`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="aappt-form-group full">
                    <label className="aappt-form-label">Symptoms / Notes</label>
                    <textarea className="aappt-form-textarea" rows={3} placeholder="Additional notes..."
                      value={bookForm.symptoms}
                      onChange={e => setBookForm({ ...bookForm, symptoms: e.target.value })} />
                  </div>
                </div>

                <div className="aappt-info-box blue" style={{ marginBottom: '1rem' }}>
                  ℹ️ Appointments booked by admin are automatically set to <strong>Confirmed</strong>.
                </div>

                <button type="submit" className="aappt-btn aappt-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }} disabled={isBooking}>
                  {isBooking ? '⏳ Booking…' : '📋 Book Appointment'}
                </button>
              </form>
            </div>
          )}

          {!showBookForm && !bookSuccess && (
            <div style={{ padding: '1.5rem 1.75rem', color: '#94a3b8', fontSize: '0.875rem' }}>
              Use this to book on behalf of a patient (walk-in, phone booking, etc.)
            </div>
          )}
        </div>

        {/* ── QR Scanner ── */}
        <div className="aappt-card aappt-fadein">
          <div className="aappt-card-header">
            <div>
              <h2 className="aappt-card-title">📷 Scan Patient QR Code</h2>
              <div className="aappt-divider" />
            </div>
            <button className="aappt-btn aappt-btn-primary"
              onClick={() => { setScanning(!scanning); setScanResult(null); setScanError(''); }}>
              {scanning ? '⏹ Stop' : '📷 Start Scanner'}
            </button>
          </div>

          {scanning && (
            <div className="aappt-card-body" style={{ textAlign: 'center' }}>
              <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.875rem' }}>Point your camera at the patient's QR code</p>
              <div id="qr-reader" style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }} />
            </div>
          )}

          {scanError && (
            <div className="aappt-card-body" style={{ paddingTop: 0 }}>
              <div className="aappt-info-box red">⚠️ {scanError}</div>
            </div>
          )}

          {scanResult && (
            <div className="aappt-card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.1rem' }}>✅</span>
                <span style={{ font: '700 1rem Syne, sans-serif', color: '#059669' }}>Patient Scanned!</span>
                <span className={`aappt-badge ${getBadgeClass(scanResult.status)}`}>{scanResult.status}</span>
              </div>

              <div className="aappt-scan-result">
                <div className="aappt-result-grid">
                  {[
                    ['Patient', scanResult.patientName],
                    ['Token', `#${scanResult.token}`],
                    ['Date', scanResult.date],
                    ['Time', scanResult.time],
                    ['Department', scanResult.department],
                    ['Doctor', scanResult.provider],
                  ].map(([label, val]) => (
                    <div key={label} className="aappt-result-item">
                      <label>{label}</label>
                      <span>{val}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {scanResult.status !== 'completed' && !showBillForm && (
                    <button className="aappt-btn aappt-btn-success" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                      onClick={() => { setPendingCompleteId(scanResult.appointmentId); setPendingCompleteData(scanResult); setShowBillForm(true); }}>
                      ✓ Mark as Completed + Create Bill
                    </button>
                  )}

                  {showBillForm && (
                    <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
                      <h4 style={{ font: '700 0.95rem Syne, sans-serif', color: '#0f172a', marginBottom: '1rem' }}>🧾 Bill Items</h4>
                      {billItems.map((item, idx) => (
                        <div key={idx} className="aappt-bill-row">
                          <input className="aappt-form-input" type="text" placeholder="Item name" value={item.name}
                            onChange={e => { const u = [...billItems]; u[idx].name = e.target.value; setBillItems(u); }} />
                          <input className="aappt-form-input" type="number" placeholder="Qty" min="1" value={item.qty}
                            onChange={e => { const u = [...billItems]; u[idx].qty = e.target.value; setBillItems(u); }} />
                          <input className="aappt-form-input" type="number" placeholder="₹ Amount" value={item.amount}
                            onChange={e => { const u = [...billItems]; u[idx].amount = e.target.value; setBillItems(u); }} />
                          <button className="aappt-remove-btn" onClick={() => setBillItems(billItems.filter((_, i) => i !== idx))}>✕</button>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                        <button className="aappt-btn aappt-btn-secondary aappt-btn-sm"
                          onClick={() => setBillItems([...billItems, { name: '', qty: 1, amount: '' }])}>+ Add Item</button>
                        <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>Total: ₹{billTotal.toLocaleString()}</strong>
                      </div>
                      <button className="aappt-btn aappt-btn-success" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '1rem' }}
                        onClick={markAsCompleted}>✓ Confirm & Save Bill</button>
                    </div>
                  )}

                  {scanResult.status === 'completed' && (
                    <div className="aappt-info-box green" style={{ justifyContent: 'center', fontWeight: 700 }}>✓ Completed!</div>
                  )}

                  {scanResult.status === 'completed' && !scanResult.paid && (
                    <button className="aappt-btn aappt-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)' }}
                      onClick={() => markAsPaid(scanResult.appointmentId)}>
                      💳 Mark as Paid
                    </button>
                  )}

                  {scanResult.paid && (
                    <div className="aappt-info-box blue" style={{ justifyContent: 'center', fontWeight: 700 }}>✅ Payment Received!</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!scanning && !scanResult && (
            <div className="aappt-scan-placeholder">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', opacity: 0.4 }}>📷</div>
              <div style={{ fontSize: '0.875rem' }}>Click "Start Scanner" to scan a patient's QR code</div>
            </div>
          )}
        </div>

        {/* ── Filters ── */}
        <div className="aappt-filters">
          <div className="aappt-filter-group">
            <span className="aappt-filter-label">🔍 Department</span>
            <select className="aappt-select" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
              <option value="all">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="aappt-filter-group">
            <span className="aappt-filter-label">Status</span>
            <select className="aappt-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="aappt-filter-group">
            <span className="aappt-filter-label">Date</span>
            <input className="aappt-input" type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
          </div>
          {(departmentFilter !== 'all' || statusFilter !== 'all' || dateFilter) && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="aappt-btn aappt-btn-secondary"
                onClick={() => { setDepartmentFilter('all'); setStatusFilter('all'); setDateFilter(''); }}>
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* ── Table ── */}
        <div className="aappt-card">
          <div className="aappt-card-header">
            <div>
              <h2 className="aappt-card-title">
                {departmentFilter !== 'all' ? departmentFilter : 'All'} Appointments
                <span style={{ font: '400 0.8rem DM Sans, sans-serif', color: '#94a3b8', marginLeft: '0.5rem' }}>
                  ({filteredAppointments.length})
                </span>
              </h2>
              <div className="aappt-divider" />
            </div>
          </div>
          <div style={{ padding: 0 }}>
            {filteredAppointments.length === 0 ? (
              <div className="aappt-empty">
                <span className="aappt-empty-icon">📅</span>
                <div style={{ fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>No appointments found</div>
                <div style={{ fontSize: '0.8rem' }}>
                  {statusFilter !== 'all' || dateFilter ? 'Try adjusting your filters' : 'New appointments will appear here'}
                </div>
              </div>
            ) : (
              <table className="aappt-table">
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
                  {filteredAppointments.map(appt => (
                    <tr key={appt.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{appt.patientName || 'N/A'}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{appt.patientId}</div>
                      </td>
                      <td>{appt.appointmentType}</td>
                      <td>{appt.provider}</td>
                      <td>{appt.department}</td>
                      <td>{appt.date}</td>
                      <td>{appt.time}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                          <span className={`aappt-badge ${getBadgeClass(appt.status)}`}>{appt.status || 'pending'}</span>
                          {appt.paymentStatus === 'paid' && <span className="aappt-badge paid">Paid</span>}
                          {appt.isUrgent && <span className="aappt-badge urgent">🚨 Urgent</span>}
                        </div>
                      </td>
                      <td>
                        <div className="aappt-table-actions">
                          {(!appt.status || appt.status === 'pending') && (
                            <button className="aappt-btn aappt-btn-success aappt-btn-sm" onClick={() => handleApprove(appt.id)} title="Approve">✓</button>
                          )}
                          {appt.status !== 'cancelled' && (
                            <button className="aappt-btn aappt-btn-danger aappt-btn-sm" onClick={() => handleCancel(appt.id)} title="Cancel">✕</button>
                          )}
                          <button className="aappt-btn aappt-btn-icon aappt-btn-sm" onClick={() => setSelectedAppointment(appt)} title="View">👁</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ── Details Modal ── */}
      {selectedAppointment && (
        <div className="aappt-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelectedAppointment(null); }}>
          <div className="aappt-modal">
            <div className="aappt-modal-header">
              <h2 className="aappt-modal-title">Appointment Details</h2>
              <button className="aappt-modal-close" onClick={() => setSelectedAppointment(null)}>✕</button>
            </div>
            <div className="aappt-modal-body">
              {/* Patient */}
              <div className="aappt-modal-field">
                <div className="aappt-modal-field-label">Patient</div>
                <div className="aappt-modal-field-value">{selectedAppointment.patientName}</div>
                <div className="aappt-modal-field-sub">ID: {selectedAppointment.patientId}</div>
              </div>

              <div className="aappt-modal-grid">
                {[
                  ['Type', selectedAppointment.appointmentType],
                  ['Department', selectedAppointment.department],
                  ['Doctor', selectedAppointment.provider],
                  ['Date', selectedAppointment.date],
                  ['Time', selectedAppointment.time],
                ].map(([label, val]) => (
                  <div key={label} className="aappt-modal-field" style={{ margin: 0 }}>
                    <div className="aappt-modal-field-label">{label}</div>
                    <div className="aappt-modal-field-value" style={{ fontSize: '0.9rem' }}>{val}</div>
                  </div>
                ))}
                <div className="aappt-modal-field" style={{ margin: 0 }}>
                  <div className="aappt-modal-field-label">Status</div>
                  <span className={`aappt-badge ${getBadgeClass(selectedAppointment.status)}`}>
                    {selectedAppointment.status || 'pending'}
                  </span>
                </div>
              </div>

              {selectedAppointment.isUrgent && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  <span className="aappt-badge urgent">🚨 URGENT CARE</span>
                  {selectedAppointment.vehicleSupport === 'yes' && (
                    <span style={{ padding: '0.25rem 0.65rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #93c5fd', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 700 }}>
                      🚗 Vehicle Support Requested
                    </span>
                  )}
                </div>
              )}

              {selectedAppointment.reason && (
                <div className="aappt-modal-field">
                  <div className="aappt-modal-field-label">Reason for Visit</div>
                  <div style={{ fontSize: '0.875rem', color: '#334155' }}>{selectedAppointment.reason}</div>
                </div>
              )}

              {selectedAppointment.symptoms && (
                <div className="aappt-modal-field">
                  <div className="aappt-modal-field-label">Symptoms</div>
                  <div style={{ fontSize: '0.875rem', color: '#334155' }}>{selectedAppointment.symptoms}</div>
                </div>
              )}

              <div className="aappt-modal-field">
                <div className="aappt-modal-field-label">Preferred Contact</div>
                <div style={{ fontSize: '0.875rem', color: '#334155', textTransform: 'capitalize' }}>
                  {selectedAppointment.preferredContact || 'Email'}
                </div>
              </div>

              <div className="aappt-modal-footer">
                {(!selectedAppointment.status || selectedAppointment.status === 'pending') && (
                  <button className="aappt-btn aappt-btn-success"
                    onClick={() => { handleApprove(selectedAppointment.id); setSelectedAppointment(null); }}>
                    Approve
                  </button>
                )}
                {selectedAppointment.status !== 'cancelled' && (
                  <button className="aappt-btn aappt-btn-danger"
                    onClick={() => { handleCancel(selectedAppointment.id); setSelectedAppointment(null); }}>
                    Cancel
                  </button>
                )}
                <button className="aappt-btn aappt-btn-secondary" onClick={() => setSelectedAppointment(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAppointments;