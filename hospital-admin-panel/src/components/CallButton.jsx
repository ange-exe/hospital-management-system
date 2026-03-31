import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';

function CallButton({ appointment }) {
  const [callStatus, setCallStatus] = useState('idle'); // idle | calling | active | ended

  // Listen to this call's status in Firestore
  useEffect(() => {
    if (!appointment?.id) return;
    const unsub = onSnapshot(doc(db, 'calls', appointment.id), (snap) => {
      if (snap.exists()) {
        const status = snap.data().status;
        setCallStatus(status || 'idle');
      } else {
        setCallStatus('idle');
      }
    });
    return () => unsub();
  }, [appointment?.id]);

  const handleStartCall = async () => {
    if (!appointment?.id) {
      alert('No appointment ID found.');
      return;
    }
    try {
      await setDoc(doc(db, 'calls', appointment.id), {
        appointmentId:  appointment.id,
        status:         'calling',
        providerName:   appointment.provider  || 'Your Doctor',
        department:     appointment.department || 'Medical',
        patientName:    appointment.patientName,
        createdAt:      serverTimestamp(),
      });
      setCallStatus('calling');
    } catch (err) {
      console.error('Error starting call:', err);
      alert('Could not start call. Check console.');
    }
  };

  const handleEndCall = async () => {
    try {
      await updateDoc(doc(db, 'calls', appointment.id), {
        status: 'ended',
      });
      setCallStatus('ended');
    } catch (err) {
      console.error('Error ending call:', err);
    }
  };

  if (callStatus === 'calling') {
    return (
      <button
        onClick={handleEndCall}
        style={{
          padding: '0.5rem 1rem',
          background: '#f59e0b',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontWeight: 700,
          fontSize: '0.8rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'white', display: 'inline-block' }} />
        Ringing… (Cancel)
      </button>
    );
  }

  if (callStatus === 'active') {
    return (
      <button
        onClick={handleEndCall}
        style={{
          padding: '0.5rem 1rem',
          background: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontWeight: 700,
          fontSize: '0.8rem',
          cursor: 'pointer',
        }}
      >
        📵 End Call
      </button>
    );
  }

  return (
    <button
      onClick={handleStartCall}
      style={{
        padding: '0.5rem 1rem',
        background: '#059669',
        color: 'white',
        border: 'none',
        borderRadius: 8,
        fontWeight: 700,
        fontSize: '0.8rem',
        cursor: 'pointer',
      }}
    >
      📹 Video Call
    </button>
  );
}

export default CallButton;