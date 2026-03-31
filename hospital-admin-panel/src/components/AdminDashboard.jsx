import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .adash-root {
    font-family: 'DM Sans', sans-serif;
    background: #f0f4f8;
    min-height: 100vh;
    color: #0f172a;
  }

  .adash-header {
    background: linear-gradient(135deg, #0f2942 0%, #0a3d62 60%, #0d6e6e 100%);
    padding: 2rem 2.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: hidden;
  }

  .adash-header::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 220px; height: 220px;
    border-radius: 50%;
    background: rgba(13,148,136,0.18);
    pointer-events: none;
  }

  .adash-header::after {
    content: '';
    position: absolute;
    bottom: -40px; left: 30%;
    width: 160px; height: 160px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
    pointer-events: none;
  }

  .adash-header-left h1 {
    font-family: 'Syne', sans-serif;
    font-size: 1.85rem;
    font-weight: 800;
    color: #fff;
    margin: 0 0 0.2rem;
    letter-spacing: -0.02em;
  }

  .adash-header-left p {
    color: rgba(255,255,255,0.55);
    font-size: 0.85rem;
    margin: 0;
    font-weight: 400;
  }

  .adash-avatar {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #0d9488, #14b8a6);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    color: white;
    flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(13,148,136,0.4);
  }

  .adash-user-info {
    display: flex; align-items: center; gap: 0.75rem;
  }

  .adash-user-info-text .name {
    font-weight: 600;
    font-size: 0.875rem;
    color: #fff;
  }

  .adash-user-info-text .role {
    font-size: 0.72rem;
    color: rgba(255,255,255,0.5);
  }

  .adash-content {
    padding: 2rem 2.5rem;
    max-width: 1400px;
  }

  /* ── Stat cards ── */
  .adash-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem;
    margin-bottom: 2rem;
  }

  @media (max-width: 900px) { .adash-stats { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 520px) { .adash-stats { grid-template-columns: 1fr; } }

  .adash-stat {
    background: #fff;
    border-radius: 16px;
    padding: 1.5rem;
    border: 1px solid #e8edf2;
    box-shadow: 0 1px 4px rgba(15,41,66,0.06);
    position: relative;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .adash-stat:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(15,41,66,0.1);
  }

  .adash-stat-accent {
    position: absolute;
    top: 0; right: 0;
    width: 80px; height: 80px;
    border-radius: 0 16px 0 80px;
    opacity: 0.08;
  }

  .adash-stat-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  .adash-stat-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.35rem;
  }

  .adash-stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 2.2rem;
    font-weight: 800;
    color: #0f172a;
    line-height: 1;
    margin-bottom: 0.4rem;
  }

  .adash-stat-sub {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .adash-stat-sub.positive { color: #10b981; }

  /* ── Cards ── */
  .adash-card {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e8edf2;
    box-shadow: 0 1px 4px rgba(15,41,66,0.06);
    margin-bottom: 1.5rem;
    overflow: hidden;
  }

  .adash-card-header {
    padding: 1.25rem 1.75rem;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .adash-card-title {
    font-family: 'Syne', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }

  /* ── Table ── */
  .adash-table {
    width: 100%;
    border-collapse: collapse;
  }

  .adash-table thead tr {
    background: #f8fafc;
  }

  .adash-table th {
    padding: 0.75rem 1.25rem;
    text-align: left;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #94a3b8;
    border-bottom: 1px solid #f1f5f9;
  }

  .adash-table td {
    padding: 0.9rem 1.25rem;
    font-size: 0.875rem;
    border-bottom: 1px solid #f8fafc;
    color: #334155;
  }

  .adash-table tbody tr:last-child td { border-bottom: none; }

  .adash-table tbody tr {
    transition: background 0.15s;
  }

  .adash-table tbody tr:hover {
    background: #f8fafc;
  }

  /* ── Badge ── */
  .adash-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.65rem;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: capitalize;
  }

  .adash-badge.confirmed  { background: #d1fae5; color: #065f46; }
  .adash-badge.pending    { background: #fef3c7; color: #92400e; }
  .adash-badge.cancelled  { background: #fee2e2; color: #991b1b; }
  .adash-badge.completed  { background: #dbeafe; color: #1e40af; }

  /* ── Quick Actions ── */
  .adash-actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.25rem;
  }

  .adash-action-card {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e8edf2;
    padding: 1.5rem;
    box-shadow: 0 1px 4px rgba(15,41,66,0.06);
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
  }

  .adash-action-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(15,41,66,0.1);
  }

  .adash-action-icon {
    font-size: 1.6rem;
    margin-bottom: 0.75rem;
    display: block;
  }

  .adash-action-title {
    font-family: 'Syne', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 0.35rem;
  }

  .adash-action-desc {
    font-size: 0.8rem;
    color: #94a3b8;
    margin: 0 0 1rem;
    line-height: 1.5;
  }

  .adash-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.55rem 1.2rem;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    border: none;
    transition: all 0.18s;
  }

  .adash-btn-primary {
    background: linear-gradient(135deg, #0d9488, #0f766e);
    color: white;
    box-shadow: 0 2px 8px rgba(13,148,136,0.3);
  }

  .adash-btn-primary:hover {
    box-shadow: 0 4px 16px rgba(13,148,136,0.45);
    transform: translateY(-1px);
  }

  .adash-btn-secondary {
    background: #f1f5f9;
    color: #475569;
  }

  .adash-btn-secondary:hover {
    background: #e2e8f0;
  }

  .adash-empty {
    padding: 3rem;
    text-align: center;
    color: #94a3b8;
  }

  .adash-empty-icon {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
    display: block;
    opacity: 0.5;
  }

  .adash-divider-line {
    width: 40px; height: 3px;
    background: linear-gradient(90deg, #0d9488, #14b8a6);
    border-radius: 2px;
    margin: 0.4rem 0 1.25rem;
  }

  /* fade in */
  @keyframes adashFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .adash-fadein { animation: adashFadeUp 0.4s ease both; }
  .adash-fadein-d1 { animation-delay: 0.05s; }
  .adash-fadein-d2 { animation-delay: 0.1s; }
  .adash-fadein-d3 { animation-delay: 0.15s; }
  .adash-fadein-d4 { animation-delay: 0.2s; }
`;

const statConfig = [
  {
    label: 'Total Appointments',
    key: 'totalAppointments',
    icon: '📅',
    sub: 'All time',
    subClass: '',
    accentColor: '#3b82f6',
    iconBg: '#eff6ff',
  },
  {
    label: 'Pending Approval',
    key: 'pendingAppointments',
    icon: '⏳',
    sub: 'Needs attention',
    subClass: '',
    accentColor: '#f59e0b',
    iconBg: '#fffbeb',
  },
  {
    label: 'Confirmed',
    key: 'confirmedAppointments',
    icon: '✓',
    sub: 'Approved',
    subClass: 'positive',
    accentColor: '#10b981',
    iconBg: '#ecfdf5',
  },
  {
    label: "Today's Schedule",
    key: 'todayAppointments',
    icon: '📆',
    sub: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    subClass: '',
    accentColor: '#0d9488',
    iconBg: '#f0fdfa',
  },
];

const quickActions = [
  { icon: '📋', title: 'Manage Appointments', desc: 'View, approve, and manage all appointments', label: 'Go to Appointments' },
  { icon: '👨‍⚕️', title: 'Manage Doctors', desc: 'Add, edit, or remove doctors from the system', label: 'Manage Doctors' },
  { icon: '👥', title: 'View Patients', desc: 'See all registered patients and their history', label: 'View Patients' },
];

function getBadgeClass(status) {
  if (status === 'confirmed') return 'confirmed';
  if (status === 'cancelled') return 'cancelled';
  if (status === 'completed') return 'completed';
  return 'pending';
}

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    todayAppointments: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      const appointmentsRef = collection(db, 'appointments');
      const querySnapshot = await getDocs(appointmentsRef);
      const appointments = [];
      querySnapshot.forEach((doc) => appointments.push({ id: doc.id, ...doc.data() }));

      const today = new Date().toISOString().split('T')[0];
      setStats({
        totalAppointments: appointments.length,
        pendingAppointments: appointments.filter(a => a.status === 'pending').length,
        confirmedAppointments: appointments.filter(a => a.status === 'confirmed').length,
        todayAppointments: appointments.filter(a => a.date === today).length,
      });
      setRecentAppointments(appointments.slice(0, 5));
    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="adash-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <style>{styles}</style>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          <div style={{ fontFamily: 'DM Sans, sans-serif' }}>Loading dashboard…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="adash-root">
      <style>{styles}</style>

      {/* Header */}
      <div className="adash-header">
        <div className="adash-header-left">
          <h1>Dashboard</h1>
          <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="adash-user-info">
          <div>
            <div className="adash-user-info-text">
              <div className="name">Admin User</div>
              <div className="role">Administrator</div>
            </div>
          </div>
          <div className="adash-avatar">A</div>
        </div>
      </div>

      <div className="adash-content">

        {/* Stats */}
        <div className="adash-stats" style={{ marginTop: '2rem' }}>
          {statConfig.map((s, i) => (
            <div key={s.key} className={`adash-stat adash-fadein adash-fadein-d${i + 1}`}>
              <div className="adash-stat-accent" style={{ background: s.accentColor }} />
              <div className="adash-stat-icon" style={{ background: s.iconBg, color: s.accentColor }}>
                {s.icon}
              </div>
              <div className="adash-stat-label">{s.label}</div>
              <div className="adash-stat-value">{stats[s.key]}</div>
              <div className={`adash-stat-sub ${s.subClass}`}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Recent Appointments */}
        <div className="adash-card adash-fadein" style={{ animationDelay: '0.25s' }}>
          <div className="adash-card-header">
            <div>
              <h2 className="adash-card-title">Recent Appointments</h2>
              <div className="adash-divider-line" />
            </div>
            <button className="adash-btn adash-btn-secondary">View All</button>
          </div>

          {recentAppointments.length === 0 ? (
            <div className="adash-empty">
              <span className="adash-empty-icon">📅</span>
              <div style={{ fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>No appointments yet</div>
              <div style={{ fontSize: '0.8rem' }}>New appointments will appear here</div>
            </div>
          ) : (
            <table className="adash-table">
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
                {recentAppointments.map((appt) => (
                  <tr key={appt.id}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{appt.patientName || 'N/A'}</td>
                    <td>{appt.appointmentType}</td>
                    <td>{appt.provider}</td>
                    <td>{appt.date}</td>
                    <td>{appt.time}</td>
                    <td>
                      <span className={`adash-badge ${getBadgeClass(appt.status)}`}>
                        {appt.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick Actions */}
        <div className="adash-actions-grid adash-fadein" style={{ animationDelay: '0.3s' }}>
          {quickActions.map((a) => (
            <div key={a.title} className="adash-action-card">
              <span className="adash-action-icon">{a.icon}</span>
              <div className="adash-action-title">{a.title}</div>
              <div className="adash-action-desc">{a.desc}</div>
              <button className="adash-btn adash-btn-primary">{a.label}</button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;