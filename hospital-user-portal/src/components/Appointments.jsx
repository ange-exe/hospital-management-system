import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, where, Timestamp } from 'firebase/firestore';

function Appointments() {
  const [formData, setFormData] = useState({
    appointmentType: '',
    department: '',
    provider: '',
    date: '',
    time: '',
    reason: '',
    symptoms: '',
    preferredContact: 'email'
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [slotAvailability, setSlotAvailability] = useState({});
  const SLOTS_PER_TIME = 5;

  const appointmentTypes = [
    'General Checkup',
    'Urgent Care',
    'Mental Health',
    'Dental',
    'Vision',
    'Vaccination',
    'Lab Work',
    'Follow-up Visit'
  ];

  const departments = [
    'General Medicine',
    'Pediatrics',
    'Cardiology',
    'Dermatology',
    'Orthopedics',
    'Mental Health',
    'Gynecology',
    'Dental'
  ];

  // Complete doctors list with departments
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

  // Get providers based on selected department
  const getAvailableProviders = () => {
    if (!formData.department) {
      return ['Please select a department first'];
    }
    const doctors = allDoctors[formData.department] || [];
    return [...doctors, 'Any Available Provider'];
  };

  const availableProviders = getAvailableProviders();

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const appointmentsRef = collection(db, 'appointments');
      const q = query(appointmentsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const appointments = [];
      querySnapshot.forEach((doc) => {
        appointments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setUpcomingAppointments(appointments);
      console.log('✅ Loaded appointments from Firebase:', appointments);
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
      setUpcomingAppointments([
        {
          date: 'February 12, 2026',
          time: '10:30 AM',
          type: 'Follow-up Visit',
          appointmentType: 'Follow-up Visit',
          provider: 'Dr. Bhandup',
          department: 'General Medicine',
          location: 'Health Center, Room 204'
        }
      ]);
    }
  };

  const checkSlotAvailability = async (date, time) => {
    try {
      const appointmentsRef = collection(db, 'appointments');
      const q = query(
        appointmentsRef, 
        where('date', '==', date),
        where('time', '==', time)
      );
      const querySnapshot = await getDocs(q);
      const bookedCount = querySnapshot.size;
      const available = SLOTS_PER_TIME - bookedCount;
      return Math.max(0, available);
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
      const available = await checkSlotAvailability(date, time);
      availability[time] = available;
    }
    
    setSlotAvailability(availability);
    console.log('✅ Slot availability loaded:', availability);
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    
    // If department changes, reset provider selection
    if (name === 'department') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        provider: ''  // Reset provider when department changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
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
      const docRef = await addDoc(appointmentsRef, {
        ...formData,
        status: 'pending',
        createdAt: Timestamp.now(),
        patientName: 'Raju Rastogi',
        patientId: 'STU-2024-1847'
      });

      console.log('✅ Appointment saved! Document ID:', docRef.id);
      setShowSuccess(true);
      
      setFormData({
        appointmentType: '',
        department: '',
        provider: '',
        date: '',
        time: '',
        reason: '',
        symptoms: '',
        preferredContact: 'email'
      });

      setSelectedDate('');
      setSlotAvailability({});
      loadAppointments();

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('❌ Error saving appointment:', error);
      alert('Error submitting appointment. Please check console.');
    } finally {
      setIsSubmitting(false);
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

      <div style={{
        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
        animation: 'slideUp 0.6s ease-out'
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
            transition: 'var(--transition-smooth)',
            whiteSpace: 'nowrap',
            fontFamily: 'var(--font-body)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
        >
          📞 Call AI Agent
        </button>
      </div>

      {showSuccess && (
        <div className="success-message">
          <span className="success-message-icon">✓</span>
          <span>Appointment saved to database! Check Firebase Console to see it!</span>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>Upcoming Appointments</h2>
          <span className="badge badge-info">{upcomingAppointments.length} Scheduled</span>
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
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem', 
                    marginBottom: '1rem' 
                  }}>
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
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                    {appointment.appointmentType || appointment.type}
                  </h4>
                  <p style={{ color: 'var(--color-text-light)', marginBottom: '0.25rem' }}>
                    <strong>Provider:</strong> {appointment.provider}
                  </p>
                  <p style={{ color: 'var(--color-text-light)', marginBottom: '0.25rem' }}>
                    <strong>Department:</strong> {appointment.department}
                  </p>
                  <p style={{ color: 'var(--color-text-light)' }}>
                    <strong>Reason:</strong> {appointment.reason || 'N/A'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ 
                      padding: '0.5rem 1rem', 
                      fontSize: '0.9rem',
                      background: 'var(--color-background)',
                      color: 'var(--color-primary)',
                      border: '2px solid var(--color-primary)'
                    }}
                  >
                    Reschedule
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    style={{ 
                      padding: '0.5rem 1rem', 
                      fontSize: '0.9rem',
                      background: 'var(--color-background)',
                      color: '#C44536',
                      border: '2px solid #C44536'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Schedule New Appointment</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="appointmentType">Appointment Type *</label>
              <select
                id="appointmentType"
                name="appointmentType"
                value={formData.appointmentType}
                onChange={handleChange}
                required
              >
                <option value="">Select appointment type</option>
                {appointmentTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select department</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="provider">Preferred Provider</label>
            <select
              id="provider"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              disabled={!formData.department}
            >
               <option value="">
                {formData.department ? 'Select provider (optional)' : 'Select department first'}
              </option>
              {availableProviders.map((provider, index) => (
                <option key={index} value={provider}>{provider}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Preferred Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">Preferred Time *</label>
              <select
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                disabled={!selectedDate}
              >
                <option value="">
                  {selectedDate ? 'Select time slot' : 'Please select a date first'}
                </option>
                
                <option value="09:00" disabled={slotAvailability['09:00'] === 0}>
                  9:00 AM {selectedDate && `(${slotAvailability['09:00'] !== undefined ? slotAvailability['09:00'] : SLOTS_PER_TIME} slots left)`}
                </option>
                <option value="09:30" disabled={slotAvailability['09:30'] === 0}>
                  9:30 AM {selectedDate && `(${slotAvailability['09:30'] !== undefined ? slotAvailability['09:30'] : SLOTS_PER_TIME} slots left)`}
                </option>
                <option value="10:00" disabled={slotAvailability['10:00'] === 0}>
                  10:00 AM {selectedDate && `(${slotAvailability['10:00'] !== undefined ? slotAvailability['10:00'] : SLOTS_PER_TIME} slots left)`}
                </option>
                <option value="10:30" disabled={slotAvailability['10:30'] === 0}>
                  10:30 AM {selectedDate && `(${slotAvailability['10:30'] !== undefined ? slotAvailability['10:30'] : SLOTS_PER_TIME} slots left)`}
                </option>
                <option value="11:00" disabled={slotAvailability['11:00'] === 0}>
                  11:00 AM {selectedDate && `(${slotAvailability['11:00'] !== undefined ? slotAvailability['11:00'] : SLOTS_PER_TIME} slots left)`}
                </option>
                <option value="11:30" disabled={slotAvailability['11:30'] === 0}>
                  11:30 AM {selectedDate && `(${slotAvailability['11:30'] !== undefined ? slotAvailability['11:30'] : SLOTS_PER_TIME} slots left)`}
                </option>
                <option value="13:00" disabled={slotAvailability['13:00'] === 0}>
                  1:00 PM {selectedDate && `(${slotAvailability['13:00'] !== undefined ? slotAvailability['13:00'] : SLOTS_PER_TIME} slots left)`}
                </option>
                <option value="13:30" disabled={slotAvailability['13:30'] === 0}>
                  1:30 PM {selectedDate && `(${slotAvailability['13:30'] !== undefined ? slotAvailability['13:30'] : SLOTS_PER_TIME} slots left)`}
                </option>
                <option value="14:00" disabled={slotAvailability['14:00'] === 0}>
                  2:00 PM {selectedDate && `(${slotAvailability['14:00'] !== undefined ? slotAvailability['14:00'] : SLOTS_PER_TIME} slots left)`}
                </option>
                <option value="14:30" disabled={slotAvailability['14:30'] === 0}>
                  2:30 PM {selectedDate && `(${slotAvailability['14:30'] !== undefined ? slotAvailability['14:30'] : SLOTS_PER_TIME} slots left)`}
                </option>
                <option value="15:00" disabled={slotAvailability['15:00'] === 0}>
                  3:00 PM {selectedDate && `(${slotAvailability['15:00'] !== undefined ? slotAvailability['15:00'] : SLOTS_PER_TIME} slots left)`}
                </option>
                <option value="15:30" disabled={slotAvailability['15:30'] === 0}>
                  3:30 PM {selectedDate && `(${slotAvailability['15:30'] !== undefined ? slotAvailability['15:30'] : SLOTS_PER_TIME} slots left)`}
                </option>
                <option value="16:00" disabled={slotAvailability['16:00'] === 0}>
                  4:00 PM {selectedDate && `(${slotAvailability['16:00'] !== undefined ? slotAvailability['16:00'] : SLOTS_PER_TIME} slots left)`}
                </option>
              </select>
              
              {selectedDate && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                  💡 Each time slot has {SLOTS_PER_TIME} available appointments
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason for Visit *</label>
            <input
              type="text"
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Brief description of why you need this appointment"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="symptoms">Symptoms (if applicable)</label>
            <textarea
              id="symptoms"
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              placeholder="Describe any symptoms you're experiencing..."
            />
          </div>

          <div className="form-group">
            <label>Preferred Contact Method</label>
            <div style={{ display: 'flex', gap: '2rem', paddingTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '400' }}>
                <input
                  type="radio"
                  name="preferredContact"
                  value="email"
                  checked={formData.preferredContact === 'email'}
                  onChange={handleChange}
                  style={{ width: 'auto' }}
                />
                Email
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '400' }}>
                <input
                  type="radio"
                  name="preferredContact"
                  value="phone"
                  checked={formData.preferredContact === 'phone'}
                  onChange={handleChange}
                  style={{ width: 'auto' }}
                />
                Phone
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '400' }}>
                <input
                  type="radio"
                  name="preferredContact"
                  value="sms"
                  checked={formData.preferredContact === 'sms'}
                  onChange={handleChange}
                  style={{ width: 'auto' }}
                />
                SMS
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? '⏳ Saving to Database...' : '✓ Submit Appointment Request'}
          </button>
        </form>
      </div>

      <div style={{ 
        padding: '1.5rem', 
        background: 'rgba(74, 124, 155, 0.1)', 
        borderRadius: '12px',
        border: '1px solid var(--color-info)'
      }}>
        <h4 style={{ marginBottom: '0.75rem', color: 'var(--color-info)' }}>
          📌 Important Information
        </h4>
        <ul style={{ paddingLeft: '1.5rem', color: 'var(--color-text-light)', lineHeight: '1.8' }}>
          <li>Appointment requests are typically confirmed within 24 hours</li>
          <li>Please arrive 10 minutes early for your appointment</li>
          <li>Bring your student ID and insurance card</li>
          <li>Cancel at least 24 hours in advance to avoid fees</li>
          <li>For urgent medical issues, call (555) 123-4567 or visit the emergency room</li>
        </ul>
      </div>
    </div>
  );
}

export default Appointments;