import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, onSnapshot, query, orderBy, where, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import Vapi from '@vapi-ai/web';
import VideoCall from './VideoCall';

const VAPI_PUBLIC_KEY = '47dccc26-6d49-426c-868b-1d3f6aaef112';
const VAPI_ASSISTANT_ID = 'c47ef318-bad9-4594-8351-c1761a481738';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

  .appt-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #faf8f4;
    min-height: 100vh;
    color: #1c3530;
    padding-bottom: 4rem;
  }

  .appt-page-header {
    padding: 2.5rem 2rem 0;
    max-width: 860px;
    margin: 0 auto;
  }

  .appt-page-header h1 {
    font-family: 'Fraunces', serif;
    font-size: 2rem;
    font-weight: 900;
    color: #1c3530;
    margin: 0 0 0.25rem;
    letter-spacing: -0.02em;
  }

  .appt-page-header p {
    font-size: 0.9rem;
    color: #7a8e89;
    margin: 0 0 2rem;
  }

  .appt-content {
    max-width: 860px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  /* ── Next Appt Banner ── */
  .appt-next-banner {
    background: linear-gradient(135deg, #2d5a4f, #3d7a6f);
    border-radius: 14px;
    padding: 1.1rem 1.5rem;
    margin-bottom: 1.5rem;
    color: white;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 4px 18px rgba(45,90,79,0.25);
  }

  .appt-next-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(255,255,255,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
    flex-shrink: 0;
  }

  .appt-next-label {
    font-weight: 700;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba(255,255,255,0.7);
    margin: 0 0 0.2rem;
  }

  .appt-next-detail {
    font-size: 0.9rem;
    color: rgba(255,255,255,0.92);
    margin: 0;
    font-weight: 500;
  }

  /* ── AI Banner ── */
  .appt-ai-banner {
    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%);
    border-radius: 18px;
    padding: 2rem;
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
    box-shadow: 0 8px 32px rgba(49,46,129,0.3);
    position: relative;
    overflow: hidden;
  }

  .appt-ai-banner::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 160px; height: 160px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
    pointer-events: none;
  }

  .appt-ai-title {
    font-family: 'Fraunces', serif;
    font-size: 1.4rem;
    font-weight: 700;
    color: #fff;
    margin: 0 0 0.4rem;
  }

  .appt-ai-sub {
    font-size: 0.875rem;
    color: rgba(255,255,255,0.6);
    margin: 0;
  }

  .appt-ai-btn {
    padding: 0.85rem 1.75rem;
    border-radius: 50px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 0.875rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .appt-ai-btn-idle {
    background: #fff;
    color: #4338ca;
    box-shadow: 0 4px 14px rgba(0,0,0,0.15);
  }

  .appt-ai-btn-idle:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  }

  .appt-ai-btn-active {
    background: #ef4444;
    color: #fff;
  }

  .appt-ai-btn-active:hover { background: #dc2626; }

  /* ── Success toast ── */
  .appt-success {
    background: #ecfdf5;
    border: 1px solid #6ee7b7;
    color: #065f46;
    border-radius: 12px;
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 600;
    font-size: 0.9rem;
    animation: hpFadeUp 0.3s ease both;
  }

  /* ── Card ── */
  .appt-card {
    background: #fff;
    border-radius: 18px;
    border: 1px solid rgba(61,122,111,0.12);
    box-shadow: 0 2px 12px rgba(28,53,48,0.05);
    margin-bottom: 1.75rem;
    overflow: hidden;
  }

  .appt-card-header {
    padding: 1.5rem 1.75rem 1rem;
    border-bottom: 1px solid #f2f5f4;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .appt-card-title {
    font-family: 'Fraunces', serif;
    font-size: 1.15rem;
    font-weight: 700;
    color: #1c3530;
    margin: 0;
  }

  .appt-card-body {
    padding: 1.5rem 1.75rem;
  }

  /* ── Form ── */
  .appt-form-group {
    margin-bottom: 1.25rem;
  }

  .appt-form-group label {
    display: block;
    font-size: 0.82rem;
    font-weight: 600;
    color: #4a6560;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.45rem;
  }

  .appt-form-group select,
  .appt-form-group input,
  .appt-form-group textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1.5px solid rgba(61,122,111,0.2);
    border-radius: 10px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9rem;
    color: #1c3530;
    background: #faf8f4;
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
    box-sizing: border-box;
  }

  .appt-form-group select:focus,
  .appt-form-group input:focus,
  .appt-form-group textarea:focus {
    border-color: #3d7a6f;
    box-shadow: 0 0 0 3px rgba(61,122,111,0.12);
    background: #fff;
  }

  .appt-form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  @media (max-width: 580px) { .appt-form-row { grid-template-columns: 1fr; } }

  .appt-radio-group {
    display: flex;
    gap: 1.5rem;
    padding-top: 0.25rem;
    flex-wrap: wrap;
  }

  .appt-radio-label {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.875rem;
    font-weight: 400;
    color: #4a6560;
    cursor: pointer;
  }

  .appt-radio-label input {
    width: auto !important;
    accent-color: #3d7a6f;
  }

  /* ── Urgent alert ── */
  .appt-urgent-alert {
    background: #fef2f2;
    border: 1px solid #fca5a5;
    border-radius: 12px;
    padding: 1rem 1.25rem;
    margin-bottom: 1.25rem;
    color: #991b1b;
    font-weight: 600;
    font-size: 0.9rem;
  }

  /* ── Submit btn ── */
  .appt-submit-btn {
    width: 100%;
    margin-top: 1.25rem;
    padding: 0.95rem;
    border-radius: 50px;
    border: none;
    background: linear-gradient(135deg, #2d5a4f, #3d7a6f);
    color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(45,90,79,0.3);
    transition: all 0.2s;
  }

  .appt-submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(45,90,79,0.4);
  }

  .appt-submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  .appt-submit-btn.urgent {
    background: linear-gradient(135deg, #b91c1c, #ef4444);
    box-shadow: 0 4px 16px rgba(185,28,28,0.35);
  }

  /* ── Badge ── */
  .appt-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.7rem;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: capitalize;
  }

  .appt-badge-info     { background: #e0f2fe; color: #0369a1; }
  .appt-badge-success  { background: #dcfce7; color: #15803d; }
  .appt-badge-pending  { background: #fef3c7; color: #92400e; }
  .appt-badge-cancelled{ background: #fee2e2; color: #991b1b; }
  .appt-badge-urgent   { background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; }
  .appt-badge-vehicle  { background: #eff6ff; color: #1d4ed8; border: 1px solid #93c5fd; }

  /* ── Appointment item ── */
  .appt-item {
    padding: 1.5rem 1.75rem;
    border-bottom: 1px solid #f2f5f4;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
    transition: background 0.15s;
  }

  .appt-item:last-child { border-bottom: none; }
  .appt-item:hover { background: rgba(61,122,111,0.02); }

  .appt-item-left { flex: 1; }

  .appt-item-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .appt-date-chip {
    padding: 0.35rem 0.85rem;
    border-radius: 8px;
    background: #2d5a4f;
    color: #fff;
    font-weight: 700;
    font-size: 0.82rem;
  }

  .appt-date-chip.urgent { background: #ef4444; }

  .appt-time-chip {
    padding: 0.35rem 0.85rem;
    border-radius: 8px;
    background: rgba(61,122,111,0.1);
    color: #2d5a4f;
    font-weight: 700;
    font-size: 0.82rem;
  }

  .appt-item-reason {
    font-family: 'Fraunces', serif;
    font-size: 1.05rem;
    font-weight: 600;
    color: #1c3530;
    margin: 0 0 0.35rem;
  }

  .appt-item-meta {
    font-size: 0.83rem;
    color: #7a8e89;
    margin: 0 0 0.2rem;
  }

  .appt-item-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-end;
    flex-shrink: 0;
  }

  .appt-action-btn {
    padding: 0.5rem 1.1rem;
    border-radius: 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    border: 1.5px solid;
    white-space: nowrap;
  }

  .appt-action-btn-join {
    background: #059669;
    color: white;
    border-color: #059669;
    box-shadow: 0 2px 8px rgba(5,150,105,0.3);
  }

  .appt-action-btn-reschedule {
    background: transparent;
    color: #3d7a6f;
    border-color: rgba(61,122,111,0.4);
  }

  .appt-action-btn-reschedule:hover { background: rgba(61,122,111,0.08); }

  .appt-action-btn-cancel {
    background: transparent;
    color: #b83c3c;
    border-color: rgba(184,60,60,0.3);
  }

  .appt-action-btn-cancel:hover { background: rgba(184,60,60,0.06); }

  /* ── Empty state ── */
  .appt-empty {
    padding: 3rem;
    text-align: center;
    color: #a0b5b0;
  }

  .appt-empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; display: block; opacity: 0.5; }

  /* ── Info box ── */
  .appt-info-box {
    background: #f0fdf8;
    border: 1px solid rgba(61,122,111,0.2);
    border-radius: 14px;
    padding: 1.5rem;
  }

  .appt-info-box h4 {
    font-family: 'Fraunces', serif;
    color: #2d5a4f;
    font-size: 0.95rem;
    margin: 0 0 0.75rem;
  }

  .appt-info-box ul {
    padding-left: 1.25rem;
    color: #5a7a74;
    font-size: 0.85rem;
    line-height: 1.9;
    margin: 0;
  }

  /* ── QR Modal ── */
  .appt-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15,30,28,0.75);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 1rem;
  }

  .appt-modal {
    background: #fff;
    border-radius: 22px;
    padding: 2.5rem;
    max-width: 640px;
    width: 100%;
    box-shadow: 0 24px 64px rgba(0,0,0,0.25);
    animation: hpFadeUp 0.3s ease both;
  }

  .appt-modal-icon {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    background: linear-gradient(135deg, #2d5a4f, #3d7a6f);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    margin: 0 auto 1.25rem;
  }

  .appt-modal-icon.urgent { background: linear-gradient(135deg, #b91c1c, #ef4444); }

  .appt-modal h2 {
    font-family: 'Fraunces', serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1c3530;
    margin: 0 0 0.25rem;
    text-align: center;
  }

  .appt-modal-token {
    text-align: center;
    font-size: 0.82rem;
    color: #7a8e89;
    margin-bottom: 2rem;
  }

  .appt-modal-body {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .appt-modal-details {
    flex: 1;
    background: #faf8f4;
    border-radius: 12px;
    padding: 1.25rem;
    font-size: 0.875rem;
  }

  .appt-modal-detail-row {
    display: flex;
    justify-content: space-between;
    padding: 0.4rem 0;
    border-bottom: 1px solid rgba(61,122,111,0.08);
    gap: 1rem;
  }

  .appt-modal-detail-row:last-child { border-bottom: none; }

  .appt-modal-detail-label { color: #7a8e89; font-weight: 500; }
  .appt-modal-detail-value { color: #1c3530; font-weight: 600; text-align: right; }

  .appt-modal-qr {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    background: #faf8f4;
    padding: 1rem;
    border-radius: 12px;
  }

  .appt-modal-qr-label {
    font-size: 0.75rem;
    color: #7a8e89;
    font-weight: 600;
    text-align: center;
  }

  .appt-modal-close-btn {
    width: 100%;
    padding: 0.9rem;
    border-radius: 50px;
    border: none;
    background: linear-gradient(135deg, #2d5a4f, #3d7a6f);
    color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 14px rgba(45,90,79,0.3);
  }

  .appt-modal-close-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(45,90,79,0.4);
  }

  /* ── Transcript bubble ── */
  .appt-transcript-wrap {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 999;
  }

  .appt-transcript-panel {
    width: 320px;
    height: 420px;
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 12px 40px rgba(28,53,48,0.18);
    display: flex;
    flex-direction: column;
    margin-bottom: 0.75rem;
    overflow: hidden;
    border: 1px solid rgba(61,122,111,0.12);
    animation: hpFadeUp 0.25s ease both;
  }

  .appt-transcript-header {
    background: linear-gradient(135deg, #1e1b4b, #4338ca);
    padding: 0.875rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .appt-transcript-title {
    color: #fff;
    font-weight: 700;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .appt-transcript-body {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: #faf8f4;
  }

  .appt-transcript-fab {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, #312e81, #4338ca);
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 18px rgba(67,56,202,0.4);
    font-size: 1.3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
    position: relative;
    transition: transform 0.18s;
  }

  .appt-transcript-fab:hover { transform: scale(1.08); }

  .appt-live-dot {
    position: absolute;
    top: 3px; right: 3px;
    width: 11px; height: 11px;
    background: #4ade80;
    border-radius: 50%;
    border: 2px solid white;
  }

  .appt-live-indicator {
    width: 8px; height: 8px;
    background: #4ade80;
    border-radius: 50%;
    display: inline-block;
    animation: pulse 1.5s infinite;
  }

  .appt-history-btn {
    background: rgba(255,255,255,0.15);
    border: none;
    border-radius: 6px;
    color: white;
    font-size: 0.72rem;
    padding: 0.2rem 0.5rem;
    cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .appt-msg-bubble {
    display: flex;
    flex-direction: column;
  }

  .appt-msg-bubble.user { align-items: flex-end; }
  .appt-msg-bubble.assistant { align-items: flex-start; }

  .appt-msg-text {
    max-width: 80%;
    padding: 0.6rem 0.9rem;
    font-size: 0.82rem;
    line-height: 1.45;
    box-shadow: 0 1px 4px rgba(0,0,0,0.07);
  }

  .appt-msg-text.user {
    border-radius: 12px 12px 2px 12px;
    background: #312e81;
    color: white;
  }

  .appt-msg-text.assistant {
    border-radius: 12px 12px 12px 2px;
    background: #fff;
    color: #1c3530;
  }

  .appt-msg-meta {
    font-size: 0.68rem;
    color: #a0b5b0;
    margin-top: 0.2rem;
  }

  @keyframes hpFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

  @keyframes dot-pulse {
    0%,100% { transform:scale(1); opacity:1; }
    50%      { transform:scale(1.7); opacity:.4; }
  }
`;

function Appointments({ onNavigateToMedicalRecords }) {
  const [formData, setFormData] = useState({
    reasonForVisit: '',
    customReason: '',
    department: '',
    provider: '',
    date: '',
    time: '',
    symptoms: '',
    vehicleSupport: '',
    preferredContact: 'email'
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [slotAvailability, setSlotAvailability] = useState({});
  const SLOTS_PER_TIME = 5;
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const vapiRef = useRef(null);
  const [vapiStatus, setVapiStatus] = useState('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState([]);
  const [showTranscript, setShowTranscript] = useState(false);
  const [pastTranscripts, setPastTranscripts] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const transcriptEndRef = useRef(null);
  const timerRef = useRef(null);
  const transcriptRef = useRef([]);

  const updateTranscript = (updaterFn) => {
    setTranscript(prev => {
      const next = updaterFn(prev);
      transcriptRef.current = next;
      return next;
    });
  };

  const reasonOptions = ['URGENT CARE', 'General Checkup', 'Follow-up', 'Vaccination', 'Other'];

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

  const getAvailableProviders = () => {
    if (!formData.department) return ['Please select a department first'];
    return [...(allDoctors[formData.department] || []), 'Any Available Provider'];
  };

  const handleVapiBooking = async (params) => {
    console.log('VAPI params received:', params);
    try {
      const nextToken = Date.now().toString().slice(-4);
      await addDoc(collection(db, 'appointments'), {
        department: params.department || '',
        provider: params.doctor_id || 'Any Available Provider',
        date: params.date || '',
        time: params.time_slot || '',
        reasonForVisit: params.reason || 'General Checkup',
        symptoms: params.symptoms || '',
        vehicleSupport: params.vehicleSupport || 'no',
        isUrgent: params.isUrgent || false,
        status: 'pending',
        preferredContact: 'phone',
        patientName: 'Raju Rastogi',
        patientId: 'STU-2024-1847',
        tokenNumber: nextToken,
        bookedByVapi: true,
        createdAt: Timestamp.now()
      });
    } catch (error) {
      console.error('❌ VAPI booking failed:', error);
    }
  };

  useEffect(() => {
    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;

    vapi.on('call-start', () => {
      setVapiStatus('active');
      setTranscript([]);
      timerRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    });

    vapi.on('call-end', () => {
      setVapiStatus('idle');
      clearInterval(timerRef.current);
      setCallDuration(0);
      if (transcriptRef.current.length > 0) saveTranscriptToFirebase(transcriptRef.current);
    });

    vapi.on('message', (msg) => {
      console.log('VAPI MESSAGE:', msg.type, msg);
      if (msg.transcriptType === 'final') {
        updateTranscript(prev => [...prev.filter(m => !m.isPartial), { role: msg.role, text: msg.transcript, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isPartial: false }]);
      } else if (msg.transcriptType === 'partial') {
        updateTranscript(prev => [...prev.filter(m => !m.isPartial), { role: msg.role, text: msg.transcript, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isPartial: true }]);
      }
      if (msg.type === 'tool-calls') {
        msg.toolCallList?.forEach((tool) => {
          if (tool.function?.name === 'book_appointment') {
            try {
              const params = typeof tool.function.arguments === 'string' ? JSON.parse(tool.function.arguments) : tool.function.arguments;
              handleVapiBooking(params);
            } catch (err) { console.error('Failed to parse tool arguments:', err); }
          }
        });
      }
    });

    vapi.on('error', (err) => {
      console.error('VAPI error FULL:', JSON.stringify(err));
      setVapiStatus('error');
      clearInterval(timerRef.current);
      setTimeout(() => setVapiStatus('idle'), 3000);
    });

    return () => { clearInterval(timerRef.current); vapi.stop(); };
  }, []);

  const saveTranscriptToFirebase = async (transcriptData) => {
    try {
      await addDoc(collection(db, 'call_transcripts'), {
        patientId: 'STU-2024-1847',
        patientName: 'Raju Rastogi',
        transcript: transcriptData,
        createdAt: Timestamp.now(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } catch (err) { console.error('❌ Failed to save transcript:', err); }
  };

  const [activeCalls, setActiveCalls] = useState({});
  const [openCall, setOpenCall] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'calls'), (snap) => {
      const live = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.status === 'calling' || data.status === 'active') live[d.id] = { ...data, callDocId: d.id };
      });
      setActiveCalls(live);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'appointments'), where('patientId', '==', 'STU-2024-1847'), where('status', 'in', ['pending', 'confirmed']), orderBy('date', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setUpcomingAppointments(list.filter(a => a.status !== 'completed' && a.status !== 'cancelled').sort((a, b) => new Date(a.date) - new Date(b.date)));
    }, (err) => console.error('❌ Error:', err));
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'call_transcripts'), where('patientId', '==', 'STU-2024-1847'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const history = [];
      snap.forEach(d => history.push({ id: d.id, ...d.data() }));
      setPastTranscripts(history);
    });
    return () => unsub();
  }, []);

  useEffect(() => { transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [transcript]);

  const checkSlotAvailability = async (date, time) => {
    try {
      const snap = await getDocs(query(collection(db, 'appointments'), where('date', '==', date), where('time', '==', time)));
      return Math.max(0, SLOTS_PER_TIME - snap.size);
    } catch { return SLOTS_PER_TIME; }
  };

  const loadSlotAvailability = async (date) => {
    const slots = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00'];
    const avail = {};
    for (const t of slots) avail[t] = await checkSlotAvailability(date, t);
    setSlotAvailability(avail);
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    if (name === 'department') setFormData(prev => ({ ...prev, [name]: value, provider: '' }));
    else if (name === 'reasonForVisit' && value !== 'Other') setFormData(prev => ({ ...prev, [name]: value, customReason: '' }));
    else setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'date' && value) { setSelectedDate(value); await loadSlotAvailability(value); }
  };

  const emptyForm = { reasonForVisit: '', customReason: '', department: '', provider: '', date: '', time: '', symptoms: '', vehicleSupport: '', preferredContact: 'email' };

  const isUrgent = formData.reasonForVisit === 'URGENT CARE';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const nextToken = Date.now().toString().slice(-4);
      const docRef = await addDoc(collection(db, 'appointments'), {
        ...formData, status: 'pending', isUrgent,
        date: isUrgent ? 'ASAP' : formData.date,
        time: isUrgent ? 'ASAP' : formData.time,
        createdAt: Timestamp.now(), patientName: 'Raju Rastogi', patientId: 'STU-2024-1847', tokenNumber: nextToken
      });
      setCurrentAppointment({ id: docRef.id, ...formData, isUrgent, date: isUrgent ? 'ASAP' : formData.date, time: isUrgent ? 'ASAP' : formData.time, patientId: 'STU-2024-1847', patientName: 'Raju Rastogi', tokenNumber: nextToken });
      setShowQRModal(true);
      setFormData(emptyForm);
      setSelectedDate('');
      setSlotAvailability({});
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('Error submitting appointment. Please check console.');
    } finally { setIsSubmitting(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try { await updateDoc(doc(db, 'appointments', id), { status: 'cancelled' }); }
    catch (e) { console.error(e); alert('Error cancelling.'); }
  };

  const handleCallAgent = async () => {
    if (vapiStatus === 'active') { vapiRef.current.stop(); return; }
    setVapiStatus('loading');
    try { await vapiRef.current.start(VAPI_ASSISTANT_ID); }
    catch (err) { console.error(err); setVapiStatus('error'); setTimeout(() => setVapiStatus('idle'), 3000); }
  };

  const getBadgeClass = (status) => {
    if (status === 'confirmed') return 'appt-badge-success';
    if (status === 'cancelled') return 'appt-badge-cancelled';
    if (status === 'completed') return 'appt-badge-info';
    return 'appt-badge-pending';
  };

  const statusLabel = (s) => {
    if (s === 'confirmed') return '✓ Confirmed';
    if (s === 'completed') return '✓ Completed';
    if (s === 'cancelled') return '✕ Cancelled';
    return '⏳ Pending';
  };

  return (
    <div className="appt-root">
      <style>{styles}</style>

      {openCall && (
        <VideoCall
          appointment={openCall.appointment}
          currentUser={{ uid: 'STU-2024-1847', displayName: 'Raju Rastogi', email: 'raju@student.edu', role: 'patient' }}
          onClose={() => setOpenCall(null)}
        />
      )}

      <div className="appt-page-header">
        <h1>Appointments</h1>
        <p>Schedule new appointments and manage your upcoming visits</p>
      </div>

      <div className="appt-content">

        {/* Next appointment banner */}
        {upcomingAppointments.length > 0 && (
          <div className="appt-next-banner">
            <div className="appt-next-icon">📅</div>
            <div>
              <div className="appt-next-label">Next Appointment</div>
              <div className="appt-next-detail">
                {upcomingAppointments[0].date} at {upcomingAppointments[0].time} — {upcomingAppointments[0].department} with {upcomingAppointments[0].provider}
              </div>
            </div>
          </div>
        )}

        {/* AI banner */}
        <div className="appt-ai-banner">
          <div>
            <div className="appt-ai-title">🤖 Book with AI Assistant</div>
            <p className="appt-ai-sub">Talk to our AI agent to schedule appointments hands-free via phone call</p>
          </div>
          <button
            onClick={handleCallAgent}
            disabled={vapiStatus === 'loading'}
            className={`appt-ai-btn ${vapiStatus === 'active' ? 'appt-ai-btn-active' : 'appt-ai-btn-idle'}`}
          >
            {vapiStatus === 'loading' && '⏳ Connecting...'}
            {vapiStatus === 'active' && '🔴 End Call'}
            {vapiStatus === 'idle' && '📞 Call AI Agent'}
            {vapiStatus === 'error' && '❌ Try Again'}
          </button>
        </div>

        {showSuccess && (
          <div className="appt-success">
            <span>✓</span> Appointment saved to database!
          </div>
        )}

        {/* Schedule form */}
        <div className="appt-card">
          <div className="appt-card-header">
            <h2 className="appt-card-title">Schedule New Appointment</h2>
          </div>
          <div className="appt-card-body">
            <form onSubmit={handleSubmit}>

              <div className="appt-form-group">
                <label htmlFor="reasonForVisit">Reason for Visit *</label>
                <select id="reasonForVisit" name="reasonForVisit" value={formData.reasonForVisit} onChange={handleChange} required>
                  <option value="">Select reason for visit</option>
                  {reasonOptions.map((r) => (
                    <option key={r} value={r}>{r === 'URGENT CARE' ? '⚠️ ' + r : r}</option>
                  ))}
                </select>
              </div>

              {isUrgent && (
                <>
                  <div className="appt-urgent-alert">🚨 Urgent Care selected — your appointment will be booked as ASAP priority.</div>
                  <div className="appt-form-group">
                    <label htmlFor="symptoms">Describe your symptoms *</label>
                    <textarea id="symptoms" name="symptoms" value={formData.symptoms} onChange={handleChange} placeholder="Briefly describe what you're experiencing..." required rows="4" />
                  </div>
                  <div className="appt-form-group">
                    <label>Do you need vehicle / ambulance support?</label>
                    <div className="appt-radio-group">
                      <label className="appt-radio-label">
                        <input type="radio" name="vehicleSupport" value="yes" checked={formData.vehicleSupport === 'yes'} onChange={handleChange} />
                        Yes, I need a vehicle 🚗
                      </label>
                      <label className="appt-radio-label">
                        <input type="radio" name="vehicleSupport" value="no" checked={formData.vehicleSupport === 'no'} onChange={handleChange} />
                        No, I'm okay
                      </label>
                    </div>
                  </div>
                </>
              )}

              {!isUrgent && (
                <>
                  <div className="appt-form-row">
                    <div className="appt-form-group">
                      <label htmlFor="department">Department *</label>
                      <select id="department" name="department" value={formData.department} onChange={handleChange} required>
                        <option value="">Select department</option>
                        {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="appt-form-group">
                      <label htmlFor="provider">Preferred Provider</label>
                      <select id="provider" name="provider" value={formData.provider} onChange={handleChange} disabled={!formData.department}>
                        <option value="">{formData.department ? 'Select provider (optional)' : 'Select department first'}</option>
                        {getAvailableProviders().map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="appt-form-row">
                    <div className="appt-form-group">
                      <label htmlFor="date">Preferred Date *</label>
                      <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} min={new Date().toISOString().split('T')[0]} required />
                    </div>
                    <div className="appt-form-group">
                      <label htmlFor="time">Preferred Time *</label>
                      <select id="time" name="time" value={formData.time} onChange={handleChange} required disabled={!selectedDate}>
                        <option value="">{selectedDate ? 'Select time slot' : 'Please select a date first'}</option>
                        {[['09:00','9:00 AM'],['09:30','9:30 AM'],['10:00','10:00 AM'],['10:30','10:30 AM'],['11:00','11:00 AM'],['11:30','11:30 AM'],['13:00','1:00 PM'],['13:30','1:30 PM'],['14:00','2:00 PM'],['14:30','2:30 PM'],['15:00','3:00 PM'],['15:30','3:30 PM'],['16:00','4:00 PM']].map(([v,l]) => (
                          <option key={v} value={v} disabled={slotAvailability[v] === 0}>
                            {l} {selectedDate && `(${slotAvailability[v] !== undefined ? slotAvailability[v] : SLOTS_PER_TIME} left)`}
                          </option>
                        ))}
                      </select>
                      {selectedDate && <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: '#7a8e89' }}>💡 Each slot has {SLOTS_PER_TIME} available appointments</div>}
                    </div>
                  </div>

                  {formData.reasonForVisit === 'Other' && (
                    <div className="appt-form-group">
                      <label htmlFor="customReason">Please describe your symptoms *</label>
                      <textarea id="customReason" name="customReason" value={formData.customReason || ''} onChange={handleChange} placeholder="Describe your symptoms..." required rows="4" />
                    </div>
                  )}

                  <div className="appt-form-group">
                    <label>Preferred Contact Method</label>
                    <div className="appt-radio-group">
                      {['email', 'phone', 'sms'].map((m) => (
                        <label key={m} className="appt-radio-label">
                          <input type="radio" name="preferredContact" value={m} checked={formData.preferredContact === m} onChange={handleChange} />
                          {m.charAt(0).toUpperCase() + m.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`appt-submit-btn ${isUrgent ? 'urgent' : ''}`}
              >
                {isSubmitting ? '⏳ Saving...' : isUrgent ? '🚨 Submit Urgent Request' : '✓ Submit Appointment Request'}
              </button>
            </form>
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="appt-card">
          <div className="appt-card-header">
            <h2 className="appt-card-title">Upcoming Appointments</h2>
            <span className="appt-badge appt-badge-info">{upcomingAppointments.length} Active</span>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="appt-empty">
              <span className="appt-empty-icon">📅</span>
              <div style={{ fontWeight: 600, color: '#4a6560', marginBottom: '0.25rem' }}>No appointments scheduled yet</div>
              <div style={{ fontSize: '0.82rem' }}>Book one above to get started</div>
            </div>
          ) : (
            upcomingAppointments.map((appt, i) => {
              const liveCall = Object.values(activeCalls).find(c => c.appointmentId === appt.id) || (Object.values(activeCalls).length > 0 ? Object.values(activeCalls)[0] : null);
              return (
                <div key={appt.id || i} className="appt-item" style={{ borderLeft: appt.isUrgent ? '3px solid #ef4444' : 'none' }}>
                  <div className="appt-item-left">
                    <div className="appt-item-chips">
                      <span className={`appt-date-chip ${appt.isUrgent ? 'urgent' : ''}`}>{appt.date}</span>
                      <span className="appt-time-chip">{appt.time}</span>
                      {appt.isUrgent && <span className="appt-badge appt-badge-urgent">🚨 URGENT</span>}
                      {appt.vehicleSupport === 'yes' && <span className="appt-badge appt-badge-vehicle">🚗 Vehicle</span>}
                    </div>
                    <div className="appt-item-reason">
                      {appt.reasonForVisit === 'Other' ? appt.customReason : (appt.reasonForVisit || appt.appointmentType || 'N/A')}
                    </div>
                    {appt.symptoms && <div className="appt-item-meta"><strong>Symptoms:</strong> {appt.symptoms}</div>}
                    <div className="appt-item-meta"><strong>Provider:</strong> {appt.provider || 'To be assigned'}</div>
                    <div className="appt-item-meta"><strong>Department:</strong> {appt.department || 'To be assigned'}</div>
                    <div style={{ marginTop: '0.25rem' }}>
                      <span className={`appt-badge ${getBadgeClass(appt.status)}`}>{statusLabel(appt.status)}</span>
                    </div>
                  </div>

                  {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                    <div className="appt-item-actions">
                      {liveCall && (
                        <button
                          onClick={() => onNavigateToMedicalRecords ? onNavigateToMedicalRecords(appt.id) : setOpenCall({ appointment: appt, callDocId: liveCall.callDocId })}
                          className="appt-action-btn appt-action-btn-join"
                        >
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#a7f3d0', display: 'inline-block', marginRight: 5, animation: 'dot-pulse 1.2s ease-in-out infinite' }} />
                          📹 Join Call
                        </button>
                      )}
                      <button className="appt-action-btn appt-action-btn-reschedule">Reschedule</button>
                      <button className="appt-action-btn appt-action-btn-cancel" onClick={() => handleCancel(appt.id)}>Cancel</button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Info box */}
        <div className="appt-info-box">
          <h4>📌 Important Information</h4>
          <ul>
            <li>Appointment requests are typically confirmed within 24 hours</li>
            <li>Please arrive 10 minutes early for your appointment</li>
            <li>Bring your student ID and insurance card</li>
            <li>Cancel at least 24 hours in advance to avoid fees</li>
            <li>For urgent medical issues, call (555) 123-4567 or visit the emergency room</li>
          </ul>
        </div>
      </div>

      {/* QR Modal */}
      {showQRModal && currentAppointment && (
        <div className="appt-modal-overlay">
          <div className="appt-modal">
            <div className={`appt-modal-icon ${currentAppointment.isUrgent ? 'urgent' : ''}`}>
              {currentAppointment.isUrgent ? '🚨' : '✅'}
            </div>
            <h2>{currentAppointment.isUrgent ? 'Urgent Request Submitted!' : 'Appointment Confirmed!'}</h2>
            <div className="appt-modal-token">Token #{currentAppointment.tokenNumber}</div>

            <div className="appt-modal-body">
              <div className="appt-modal-details">
                {[
                  ['Date', currentAppointment.date],
                  ['Time', currentAppointment.time],
                  ...(!currentAppointment.isUrgent ? [['Department', currentAppointment.department], ['Doctor', currentAppointment.provider]] : []),
                  ['Reason', currentAppointment.reasonForVisit === 'Other' ? currentAppointment.customReason : currentAppointment.reasonForVisit],
                  ...(currentAppointment.isUrgent && currentAppointment.symptoms ? [['Symptoms', currentAppointment.symptoms]] : []),
                  ...(currentAppointment.isUrgent ? [['Vehicle', currentAppointment.vehicleSupport === 'yes' ? '🚗 Yes' : 'No']] : []),
                  ['Patient', currentAppointment.patientName],
                ].map(([label, value]) => (
                  <div key={label} className="appt-modal-detail-row">
                    <span className="appt-modal-detail-label">{label}</span>
                    <span className="appt-modal-detail-value">{value}</span>
                  </div>
                ))}
              </div>
              <div className="appt-modal-qr">
                <div className="appt-modal-qr-label">Show at hospital</div>
                <QRCodeSVG value={currentAppointment.id} size={160} level="L" marginSize={8} />
              </div>
            </div>

            <button className="appt-modal-close-btn" onClick={() => { setShowQRModal(false); setCurrentAppointment(null); }}>
              Done ✓
            </button>
          </div>
        </div>
      )}

      {/* Transcript bubble */}
      <div className="appt-transcript-wrap">
        {showTranscript && (
          <div className="appt-transcript-panel">
            <div className="appt-transcript-header">
              <div className="appt-transcript-title">
                {vapiStatus === 'active' && <span className="appt-live-indicator" />}
                {vapiStatus === 'active' ? 'Live — Aark is speaking' : 'Call Transcript'}
              </div>
              <button className="appt-history-btn" onClick={() => setShowHistory(p => !p)}>
                {showHistory ? 'Current' : 'History'}
              </button>
            </div>

            {showHistory ? (
              <div className="appt-transcript-body">
                {pastTranscripts.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#a0b5b0', fontSize: '0.82rem', marginTop: '2rem' }}>No past calls yet</p>
                ) : (
                  pastTranscripts.map((call) => (
                    <div key={call.id} style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(61,122,111,0.1)', paddingBottom: '1rem' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.75rem', color: '#4338ca', marginBottom: '0.4rem' }}>
                        📞 {call.date} at {call.time}
                      </p>
                      {call.transcript.map((msg, j) => (
                        <p key={j} style={{ fontSize: '0.75rem', color: msg.role === 'user' ? '#4338ca' : '#374151', margin: '0.15rem 0' }}>
                          <strong>{msg.role === 'user' ? 'You' : 'Aark'}:</strong> {msg.text}
                        </p>
                      ))}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="appt-transcript-body">
                {transcript.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#a0b5b0', fontSize: '0.82rem', marginTop: '2rem' }}>
                    {vapiStatus === 'active' ? '🎙️ Listening... Start speaking!' : 'No transcript yet'}
                  </div>
                ) : (
                  transcript.map((msg, i) => (
                    <div key={i} className={`appt-msg-bubble ${msg.role}`}>
                      <div className={`appt-msg-text ${msg.role}`} style={{ opacity: msg.isPartial ? 0.6 : 1, fontStyle: msg.isPartial ? 'italic' : 'normal' }}>
                        {msg.text}
                      </div>
                      <span className="appt-msg-meta">{msg.role === 'user' ? 'You' : 'Aark'} · {msg.time}</span>
                    </div>
                  ))
                )}
                <div ref={transcriptEndRef} />
              </div>
            )}
          </div>
        )}
        <button className="appt-transcript-fab" onClick={() => setShowTranscript(p => !p)}>
          💬
          {vapiStatus === 'active' && <span className="appt-live-dot" />}
        </button>
      </div>
    </div>
  );
}

export default Appointments;