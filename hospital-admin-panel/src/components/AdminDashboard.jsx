import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    todayAppointments: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const appointmentsRef = collection(db, 'appointments');
      const querySnapshot = await getDocs(appointmentsRef);
      
      const appointments = [];
      querySnapshot.forEach((doc) => {
        appointments.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const totalAppointments = appointments.length;
      const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
      const confirmedAppointments = appointments.filter(a => a.status === 'confirmed').length;
      const todayAppointments = appointments.filter(a => a.date === today).length;

      setStats({
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        todayAppointments,
      });

      // Get recent 5 appointments
      setRecentAppointments(appointments.slice(0, 5));
      
      console.log('✅ Dashboard data loaded:', { stats, appointments: appointments.length });
    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="fade-in">
      <div className="admin-header">
        <h1>Dashboard</h1>
        <div className="admin-header-actions">
          <div className="admin-user">
            <div className="admin-user-avatar">A</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Admin User</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Administrator</div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-content">
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon primary">
                📅
              </div>
            </div>
            <div className="stat-card-title">Total Appointments</div>
            <div className="stat-card-value">{stats.totalAppointments}</div>
            <div className="stat-card-change positive">
              All time
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon warning">
                ⏳
              </div>
            </div>
            <div className="stat-card-title">Pending Approval</div>
            <div className="stat-card-value">{stats.pendingAppointments}</div>
            <div className="stat-card-change">
              Needs attention
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon success">
                ✓
              </div>
            </div>
            <div className="stat-card-title">Confirmed</div>
            <div className="stat-card-value">{stats.confirmedAppointments}</div>
            <div className="stat-card-change positive">
              Approved
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon primary">
                📆
              </div>
            </div>
            <div className="stat-card-title">Today's Schedule</div>
            <div className="stat-card-value">{stats.todayAppointments}</div>
            <div className="stat-card-change">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </div>
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Recent Appointments</h2>
            <button className="btn btn-secondary">View All</button>
          </div>
          <div className="admin-card-body" style={{ padding: 0 }}>
            {recentAppointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <h3 className="empty-state-title">No appointments yet</h3>
                <p className="empty-state-text">New appointments will appear here</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Type</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td style={{ fontWeight: 600 }}>{appointment.patientName || 'N/A'}</td>
                      <td>{appointment.appointmentType}</td>
                      <td>{appointment.provider}</td>
                      <td>{appointment.date}</td>
                      <td>{appointment.time}</td>
                      <td>
                        <span className={`badge badge-${appointment.status === 'confirmed' ? 'success' : appointment.status === 'cancelled' ? 'cancelled' : 'pending'}`}>
                          {appointment.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div className="admin-card">
            <div className="admin-card-body">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                📋 Manage Appointments
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                View, approve, and manage all appointments
              </p>
              <button className="btn btn-primary">Go to Appointments</button>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-body">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                👨‍⚕️ Manage Doctors
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                Add, edit, or remove doctors from the system
              </p>
              <button className="btn btn-primary">Manage Doctors</button>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-body">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                👥 View Patients
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                See all registered patients and their history
              </p>
              <button className="btn btn-primary">View Patients</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
