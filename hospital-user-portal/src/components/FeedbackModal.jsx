import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp, doc, updateDoc } from 'firebase/firestore';

function FeedbackModal({ appointment, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return alert('Please select a star rating');
    setSubmitting(true);
    try {
      // 1. Save feedback doc
      await addDoc(collection(db, 'feedback'), {
        appointmentId: appointment.id,
        doctorName: appointment.provider,
        department: appointment.department,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        rating,
        comment,
        createdAt: Timestamp.now(),
      });

      // 2. Mark appointment as reviewed so modal doesn't re-appear
      await updateDoc(doc(db, 'appointments', appointment.id), {
        feedbackGiven: true,
      });

      onSubmitted();
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 }}>
      <div style={{ background:'#fff', borderRadius:18, padding:'2rem', width:380, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        <h3 style={{ margin:'0 0 0.25rem', fontFamily:'Fraunces,serif', fontSize:'1.3rem' }}>Rate your visit</h3>
        <p style={{ margin:'0 0 1.5rem', fontSize:'0.85rem', color:'#7a8e89' }}>
          {appointment.provider} · {appointment.department}
        </p>

        {/* Stars */}
        <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.25rem' }}>
          {[1,2,3,4,5].map(star => (
            <span
              key={star}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
              style={{ fontSize:'2rem', cursor:'pointer', color: star <= (hovered || rating) ? '#f59e0b' : '#e2e8f0', transition:'color 0.15s' }}
            >★</span>
          ))}
        </div>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Any comments? (optional)"
          rows={3}
          style={{ width:'100%', padding:'0.65rem 0.9rem', borderRadius:10, border:'1.5px solid #e2e8f0', fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'0.875rem', resize:'none', boxSizing:'border-box', outline:'none' }}
        />

        <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.25rem' }}>
          <button onClick={onClose} style={{ flex:1, padding:'0.75rem', borderRadius:50, border:'1.5px solid #e2e8f0', background:'#fff', cursor:'pointer', fontWeight:600, fontSize:'0.875rem' }}>
            Skip
          </button>
          <button onClick={handleSubmit} disabled={submitting} style={{ flex:2, padding:'0.75rem', borderRadius:50, border:'none', background:'linear-gradient(135deg,#2d5a4f,#3d7a6f)', color:'#fff', cursor:'pointer', fontWeight:700, fontSize:'0.875rem' }}>
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeedbackModal;