import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, statusFilter, dateFilter, departmentFilter]);

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
      console.log('✅ Loaded appointments:', appointmentsList.length);
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

  const handleApprove = async (appointmentId) => {
    if (!confirm('Approve this appointment?')) return;

    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status: 'confirmed'
      });
      
      alert('✅ Appointment approved!');
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
      
      alert('✅ Appointment cancelled!');
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
      
      alert('✅ Appointment deleted!');
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
                          appointment.status === 'cancelled' ? 'cancelled' : 
                          'pending'
                        }`}>
                          {appointment.status || 'pending'}
                        </span>
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

                <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
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
