import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, onSnapshot, query, orderBy, where, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';

function Appointments() {
  const [formData, setFormData] = useState({
  reasonForVisit: '',
  customReason: '',
  department: '',
  provider: '',
  date: '',
  time: '',
  symptoms: '',
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

  const reasonOptions = [
  'URGENT CARE',
  'General Checkup',
  'Follow-up',
  'Vaccination',
  'Other'
];

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
    const doctors = allDoctors[formData.department] || [];
    return [...doctors, 'Any Available Provider'];
  };

  const availableProviders = getAvailableProviders();

 useEffect(() => {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(
  appointmentsRef,
  where('patientId', '==', 'STU-2024-1847'),
  where('status', 'in', ['pending', 'confirmed']),
  orderBy('date', 'asc')
);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const appointments = [];
      querySnapshot.forEach((document) => {
        appointments.push({ id: document.id, ...document.data() });
      });

      // Filter only pending and confirmed, sort by date ascending
      const filtered = appointments
        .filter(a => a.status !== 'completed' && a.status !== 'cancelled')
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setUpcomingAppointments(filtered);
    }, (error) => {
      console.error('❌ Error listening to appointments:', error);
    });
    return () => unsubscribe();
  }, []);

  const checkSlotAvailability = async (date, time) => {
    try {
      const appointmentsRef = collection(db, 'appointments');
      const q = query(appointmentsRef, where('date', '==', date), where('time', '==', time));
      const querySnapshot = await getDocs(q);
      return Math.max(0, SLOTS_PER_TIME - querySnapshot.size);
    } catch (error) {
      console.error('Error checking slots:', error);
      return SLOTS_PER_TIME;
    }
  };

  const loadSlotAvailability = async (date) => {
    const timeSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'
    ];
    const availability = {};
    for (const time of timeSlots) {
      availability[time] = await checkSlotAvailability(date, time);
    }
    setSlotAvailability(availability);
  };

  const handleChange = async (e) => {
  const { name, value } = e.target;
  if (name === 'department') {
    setFormData(prev => ({ ...prev, [name]: value, provider: '' }));
  } else if (name === 'reasonForVisit' && value !== 'Other') {
    // If not "Other", clear customReason
    setFormData(prev => ({ ...prev, [name]: value, customReason: '' }));
  } else {
    setFormData(prev => ({ ...prev, [name]: value }));
  }
  
  if (name === 'date' && value) {
    setSelectedDate(value);
    await loadSlotAvailability(value);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const appointmentsRef = collection(db, 'appointments');
      const nextToken = Date.now().toString().slice(-4);
      const docRef = await addDoc(appointmentsRef, {
        ...formData,
        status: 'pending',
        createdAt: Timestamp.now(),
        patientName: 'Raju Rastogi',
        patientId: 'STU-2024-1847',
        tokenNumber: nextToken
      });
      setCurrentAppointment({
        id: docRef.id,
        ...formData,
        patientId: 'STU-2024-1847',
        patientName: 'Raju Rastogi',
        tokenNumber: nextToken
      });
      setShowQRModal(true);
      setFormData({
  reasonForVisit: '',
  customReason: '',
  department: '',
  provider: '',
  date: '',
  time: '',
  symptoms: '',
  preferredContact: 'email'
});
      setSelectedDate('');
      setSlotAvailability({});
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error(' Error saving appointment:', error);
      alert('Error submitting appointment. Please check console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseQR = () => {
    setShowQRModal(false);
    setCurrentAppointment(null);
    setFormData({
  reasonForVisit: '',
  customReason: '',
  department: '',
  provider: '',
  date: '',
  time: '',
  symptoms: '',
  preferredContact: 'email'
});
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, { status: 'cancelled' });
      console.log(' Appointment cancelled!');
    } catch (error) {
      console.error(' Error cancelling:', error);
      alert('Error cancelling appointment. Please try again.');
    }
  };

  const handleCallAgent = () => {
    alert('📞 AI Calling Agent feature coming soon! This will allow you to speak with an AI assistant to book appointments hands-free.');
  };

  return (
    <div className="slide-up">
      <div className="page-header">
        <h1>Appointments</h1>
        <p>Schedule new appointments and manage your upcoming visits</p>
      </div>
{upcomingAppointments.length > 0 && (
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
        {upcomingAppointments[0].date} at {upcomingAppointments[0].time} — {upcomingAppointments[0].department} with {upcomingAppointments[0].provider}
      </p>
    </div>
  </div>
)}

      {/* AI Assistant Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)'
      }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'white' }}>
            🤖 Book with AI Assistant
          </h3>
          <p style={{ opacity: 0.95, fontSize: '1rem' }}>
            Talk to our AI agent to schedule appointments hands-free via phone call
          </p>
        </div>
        <button
          onClick={handleCallAgent}
          style={{
            background: 'white',
            color: '#6366F1',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontFamily: 'var(--font-body)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          📞 Call AI Agent
        </button>
      </div>

      {showSuccess && (
        <div className="success-message">
          <span className="success-message-icon">✓</span>
          <span>Appointment saved to database!</span>
        </div>
      )}

      {/* Schedule New Appointment */}
      <div className="card">
        <div className="card-header">
          <h2>Schedule New Appointment</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <select id="department" name="department" value={formData.department} onChange={handleChange} required>
                <option value="">Select department</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="provider">Preferred Provider</label>
            <select id="provider" name="provider" value={formData.provider} onChange={handleChange} disabled={!formData.department}>
              <option value="">{formData.department ? 'Select provider (optional)' : 'Select department first'}</option>
              {availableProviders.map((provider, index) => (
                <option key={index} value={provider}>{provider}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Preferred Date *</label>
              <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} min={new Date().toISOString().split('T')[0]} required />
            </div>
            <div className="form-group">
              <label htmlFor="time">Preferred Time *</label>
              <select id="time" name="time" value={formData.time} onChange={handleChange} required disabled={!selectedDate}>
                <option value="">{selectedDate ? 'Select time slot' : 'Please select a date first'}</option>
                {[
                  ['09:00', '9:00 AM'], ['09:30', '9:30 AM'], ['10:00', '10:00 AM'],
                  ['10:30', '10:30 AM'], ['11:00', '11:00 AM'], ['11:30', '11:30 AM'],
                  ['13:00', '1:00 PM'], ['13:30', '1:30 PM'], ['14:00', '2:00 PM'],
                  ['14:30', '2:30 PM'], ['15:00', '3:00 PM'], ['15:30', '3:30 PM'],
                  ['16:00', '4:00 PM']
                ].map(([value, label]) => (
                  <option key={value} value={value} disabled={slotAvailability[value] === 0}>
                    {label} {selectedDate && `(${slotAvailability[value] !== undefined ? slotAvailability[value] : SLOTS_PER_TIME} slots left)`}
                  </option>
                ))}
              </select>
              {selectedDate && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                  💡 Each time slot has {SLOTS_PER_TIME} available appointments
                </div>
              )}
            </div>
          </div>

         <div className="form-group">
  <label htmlFor="reasonForVisit">Reason for Visit *</label>
  <select
    id="reasonForVisit"
    name="reasonForVisit"
    value={formData.reasonForVisit}
    onChange={handleChange}
    required
  >
    <option value="">Select reason for visit</option>
    {reasonOptions.map((reason, index) => (
      <option key={index} value={reason}>
        {reason === 'URGENT CARE' ? '⚠️' + reason : reason}
      </option>
    ))}
  </select>
</div>

{formData.reasonForVisit === 'Other' && (
  <div className="form-group">
    <label htmlFor="customReason">Please describe your symptoms *</label>
    <textarea
      id="customReason"
      name="customReason"
      value={formData.customReason || ''}
      onChange={handleChange}
      placeholder="Describe your symptoms or reason for visit..."
      required
      rows="4"
    />
  </div>
)}

          <div className="form-group">
            <label>Preferred Contact Method</label>
            <div style={{ display: 'flex', gap: '2rem', paddingTop: '0.5rem' }}>
              {['email', 'phone', 'sms'].map((method) => (
                <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '400' }}>
                  <input type="radio" name="preferredContact" value={method} checked={formData.preferredContact === method} onChange={handleChange} style={{ width: 'auto' }} />
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isSubmitting}>
            {isSubmitting ? ' Saving to Database...' : '✓ Submit Appointment Request'}
          </button>
        </form>
      </div>

    {/* Upcoming Appointments */}
      <div className="card">
        <div className="card-header">
          <h2>Upcoming Appointments</h2>
          <span className="badge badge-info">{upcomingAppointments.length} Active</span>
        </div>
        {upcomingAppointments.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-light)' }}>
            No appointments scheduled yet. Book one below!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {upcomingAppointments.map((appointment, index) => (
              <div
                key={appointment.id || index}
                style={{
                  padding: '1.5rem',
                  background: 'var(--color-background)',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--color-primary)',
                      color: 'white',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}>
                      {appointment.date}
                    </div>
                    <div style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--color-accent)',
                      color: 'var(--color-primary-dark)',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}>
                      {appointment.time}
                    </div>
                  </div>
                    {appointment.appointmentType || appointment.type}
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
  {appointment.reasonForVisit === 'Other' ? appointment.customReason : (appointment.reasonForVisit || appointment.appointmentType || 'N/A')}
</h4>
                  <p style={{ color: 'var(--color-text-light)', marginBottom: '0.25rem' }}>
                    <strong>Provider:</strong> {appointment.provider}
                  </p>
                  <p style={{ color: 'var(--color-text-light)', marginBottom: '0.25rem' }}>
                    <strong>Department:</strong> {appointment.department}
                  </p>
                  <p style={{ color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>
                    <strong>Reason:</strong> {appointment.reason || 'N/A'}
                  </p>
                  <p>
                    <strong>Status: </strong>
                    <span className={`badge badge-${
                      appointment.status === 'confirmed' ? 'success' :
                      appointment.status === 'completed' ? 'success' :
                      appointment.status === 'cancelled' ? 'cancelled' :
                      'pending'
                    }`}>
                      {appointment.status === 'completed' ? '✓ Completed' :
                       appointment.status === 'confirmed' ? '✓ Confirmed' :
                       appointment.status === 'cancelled' ? '✕ Cancelled' :
                       ' Pending'}
                    </span>
                  </p>
                </div>

                {/* Only show buttons if not completed or cancelled */}
                {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" style={{
                      padding: '0.5rem 1rem', fontSize: '0.9rem',
                      background: 'var(--color-background)',
                      color: 'var(--color-primary)',
                      border: '2px solid var(--color-primary)'
                    }}>
                      Reschedule
                    </button>
                    <button className="btn btn-secondary" style={{
                      padding: '0.5rem 1rem', fontSize: '0.9rem',
                      background: 'var(--color-background)',
                      color: '#C44536',
                      border: '2px solid #C44536'
                    }}
                      onClick={() => handleCancel(appointment.id)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Important Information */}
      <div style={{
        padding: '1.5rem',
        background: 'rgba(74, 124, 155, 0.1)',
        borderRadius: '12px',
        border: '1px solid var(--color-info)'
      }}>
        <h4 style={{ marginBottom: '0.75rem', color: 'var(--color-info)' }}>📌 Important Information</h4>
        <ul style={{ paddingLeft: '1.5rem', color: 'var(--color-text-light)', lineHeight: '1.8' }}>
          <li>Appointment requests are typically confirmed within 24 hours</li>
          <li>Please arrive 10 minutes early for your appointment</li>
          <li>Bring your student ID and insurance card</li>
          <li>Cancel at least 24 hours in advance to avoid fees</li>
          <li>For urgent medical issues, call (555) 123-4567 or visit the emergency room</li>
        </ul>
      </div>

      {/* QR Code Modal */}
      {showQRModal && currentAppointment && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2.5rem',
            borderRadius: '16px',
            maxWidth: '700px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Appointment Confirmed!</h2>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>Token #{currentAppointment.tokenNumber}</p>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                background: 'var(--color-background)',
                padding: '1.5rem',
                borderRadius: '12px',
                textAlign: 'left',
                flex: 1
              }}>
                <div style={{ marginBottom: '0.75rem' }}><strong>Date:</strong> {currentAppointment.date}</div>
                <div style={{ marginBottom: '0.75rem' }}><strong>Time:</strong> {currentAppointment.time}</div>
                <div style={{ marginBottom: '0.75rem' }}><strong>Department:</strong> {currentAppointment.department}</div>
                <div style={{ marginBottom: '0.75rem' }}><strong>Doctor:</strong> {currentAppointment.provider}</div>
                <div style={{ marginBottom: '0.75rem' }}><strong>Reason:</strong> {currentAppointment.reasonForVisit === 'Other' ? currentAppointment.customReason : currentAppointment.reasonForVisit}</div>
                <div><strong>Patient:</strong> {currentAppointment.patientName}</div>
              </div>
              <div style={{
                padding: '1rem',
                background: 'var(--color-background)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-light)', fontWeight: '600', margin: 0 }}>
                  Show at hospital
                </p>
                <QRCodeSVG
  value={currentAppointment.id}
  size={200}
  level="L"
  marginSize={10}
/>
              </div>
            </div>

            <button onClick={handleCloseQR} className="btn btn-primary" style={{ width: '100%' }}>
              Done ✓
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Appointments;