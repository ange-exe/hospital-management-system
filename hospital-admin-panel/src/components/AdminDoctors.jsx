import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .adoc-root {
    font-family: 'DM Sans', sans-serif;
    background: #f0f4f8;
    min-height: 100vh;
    color: #0f172a;
  }

  .adoc-header {
    background: linear-gradient(135deg, #0f2942 0%, #0a3d62 60%, #0d6e6e 100%);
    padding: 1.75rem 2.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: hidden;
  }
  .adoc-header::before {
    content: '';
    position: absolute;
    top: -50px; right: -50px;
    width: 180px; height: 180px;
    border-radius: 50%;
    background: rgba(13,148,136,0.15);
    pointer-events: none;
  }
  .adoc-header h1 {
    font-family: 'Syne', sans-serif;
    font-size: 1.75rem;
    font-weight: 800;
    color: #fff;
    margin: 0;
    letter-spacing: -0.02em;
  }
  .adoc-header p {
    color: rgba(255,255,255,0.5);
    font-size: 0.82rem;
    margin: 0.2rem 0 0;
  }

  .adoc-content { padding: 2rem 2.5rem; max-width: 1400px; }

  /* Stats */
  .adoc-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.1rem;
    margin: 1.75rem 0 1.5rem;
  }
  .adoc-stat {
    background: #fff;
    border-radius: 14px;
    padding: 1.25rem 1.4rem;
    border: 1px solid #e8edf2;
    box-shadow: 0 1px 3px rgba(15,41,66,0.05);
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .adoc-stat:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(15,41,66,0.09); }
  .adoc-stat-icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem; flex-shrink: 0;
  }
  .adoc-stat-label {
    font-size: 0.72rem; font-weight: 600;
    color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em;
    margin-bottom: 0.2rem;
  }
  .adoc-stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 1.7rem; font-weight: 800; line-height: 1; color: #0f172a;
  }

  /* Dept filter tabs */
  .adoc-dept-bar {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
  }
  .adoc-dept-tab {
    padding: 0.4rem 1rem;
    border-radius: 20px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    font-size: 0.78rem;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
  }
  .adoc-dept-tab:hover { border-color: #0d9488; color: #0d9488; }
  .adoc-dept-tab.active {
    background: linear-gradient(135deg, #0d9488, #0f766e);
    border-color: transparent;
    color: white;
    box-shadow: 0 2px 8px rgba(13,148,136,0.28);
  }

  /* Card */
  .adoc-card {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e8edf2;
    box-shadow: 0 1px 4px rgba(15,41,66,0.06);
    margin-bottom: 1.5rem;
    overflow: hidden;
  }
  .adoc-card-header {
    padding: 1.25rem 1.75rem;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }
  .adoc-card-title {
    font-family: 'Syne', sans-serif;
    font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0;
  }
  .adoc-card-body { padding: 1.5rem 1.75rem; }
  .adoc-divider {
    width: 36px; height: 3px;
    background: linear-gradient(90deg, #0d9488, #14b8a6);
    border-radius: 2px;
    margin: 0.3rem 0 0;
  }

  /* Doctor grid */
  .adoc-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.25rem;
    padding: 1.5rem 1.75rem;
  }
  .adoc-doctor-card {
    background: #f8fafc;
    border: 1px solid #e8edf2;
    border-radius: 14px;
    padding: 1.25rem;
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    position: relative;
  }
  .adoc-doctor-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(15,41,66,0.1);
    border-color: #0d9488;
  }
  .adoc-doctor-avatar {
    width: 48px; height: 48px;
    border-radius: 13px;
    background: linear-gradient(135deg, #0d9488, #14b8a6);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif;
    font-weight: 800; font-size: 1.1rem;
    color: white;
    margin-bottom: 0.9rem;
    box-shadow: 0 3px 10px rgba(13,148,136,0.3);
  }
  .adoc-doctor-name {
    font-family: 'Syne', sans-serif;
    font-size: 0.95rem; font-weight: 700; color: #0f172a;
    margin-bottom: 0.25rem;
  }
  .adoc-doctor-spec {
    font-size: 0.78rem; color: #0d9488; font-weight: 600;
    margin-bottom: 0.75rem;
  }
  .adoc-doctor-detail {
    font-size: 0.78rem; color: #64748b;
    display: flex; align-items: center; gap: 0.4rem;
    margin-bottom: 0.3rem;
  }
  .adoc-doctor-actions {
    display: flex; gap: 0.5rem; margin-top: 1rem;
    padding-top: 0.85rem;
    border-top: 1px solid #e8edf2;
  }

  /* Dept badge on card */
  .adoc-dept-badge {
    position: absolute;
    top: 1rem; right: 1rem;
    padding: 0.2rem 0.6rem;
    border-radius: 20px;
    font-size: 0.65rem;
    font-weight: 700;
    background: #f0fdfa;
    color: #0d9488;
    border: 1px solid #99f6e4;
  }

  /* Form */
  .adoc-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  @media (max-width: 600px) { .adoc-form-grid { grid-template-columns: 1fr; } }
  .adoc-form-group { display: flex; flex-direction: column; gap: 0.35rem; }
  .adoc-form-group.full { grid-column: 1 / -1; }
  .adoc-form-label {
    font-size: 0.72rem; font-weight: 700;
    color: #475569; text-transform: uppercase; letter-spacing: 0.05em;
  }
  .adoc-form-input, .adoc-form-select {
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
  .adoc-form-input:focus, .adoc-form-select:focus {
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13,148,136,0.1);
    background: #fff;
  }

  /* Buttons */
  .adoc-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.55rem 1.2rem;
    border-radius: 9px;
    font-size: 0.82rem; font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; border: none;
    transition: all 0.18s; white-space: nowrap;
  }
  .adoc-btn-primary {
    background: linear-gradient(135deg, #0d9488, #0f766e);
    color: white;
    box-shadow: 0 2px 8px rgba(13,148,136,0.28);
  }
  .adoc-btn-primary:hover { box-shadow: 0 4px 16px rgba(13,148,136,0.42); transform: translateY(-1px); }
  .adoc-btn-secondary { background: #f1f5f9; color: #475569; }
  .adoc-btn-secondary:hover { background: #e2e8f0; }
  .adoc-btn-danger { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  .adoc-btn-danger:hover { background: #fee2e2; }
  .adoc-btn-sm { padding: 0.38rem 0.75rem; font-size: 0.75rem; border-radius: 7px; }
  .adoc-btn-full { width: 100%; justify-content: center; padding: 0.7rem; }

  /* Empty */
  .adoc-empty { padding: 3rem; text-align: center; color: #94a3b8; }
  .adoc-empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; display: block; opacity: 0.4; }

  /* Animations */
  @keyframes adocFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .adoc-fadein { animation: adocFadeUp 0.35s ease both; }
`;

const deptColors = {
  'Cardiology':       { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  'General Medicine': { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  'Pediatrics':       { bg: '#fdf4ff', color: '#9333ea', border: '#e9d5ff' },
  'Orthopedics':      { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
  'Mental Health':    { bg: '#f0fdfa', color: '#0d9488', border: '#99f6e4' },
  'Dermatology':      { bg: '#fefce8', color: '#ca8a04', border: '#fde68a' },
  'Gynecology':       { bg: '#fdf2f8', color: '#db2777', border: '#fbcfe8' },
  'Dental':           { bg: '#f0f9ff', color: '#0284c7', border: '#bae6fd' },
  'Nursing':          { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
};

function getInitials(name) {
  return name.split(' ').filter(w => w[0] === w[0]?.toUpperCase()).map(w => w[0]).slice(0, 2).join('');
}

const departments = ['General Medicine','Pediatrics','Cardiology','Dermatology','Orthopedics','Mental Health','Gynecology','Dental'];

const initialDoctors = [
  { id: '1',  name: 'Dr. Bhandup',             specialization: 'Cardiology',       department: 'Cardiology',       phone: '+91 98765 43210', email: 'bhandup@healthportal.com' },
  { id: '2',  name: 'Dr. Dadar',               specialization: 'Cardiology',       department: 'Cardiology',       phone: '+91 98765 43220', email: 'dadar@healthportal.com' },
  { id: '5',  name: 'Dr. Andheri',             specialization: 'Pediatrics',       department: 'Pediatrics',       phone: '+91 98765 43212', email: 'andheri@healthportal.com' },
  { id: '6',  name: 'Dr. Sion',                specialization: 'Pediatrics',       department: 'Pediatrics',       phone: '+91 98765 43222', email: 'sion@healthportal.com' },
  { id: '7',  name: 'Dr. Lower Parel',         specialization: 'Orthopedics',      department: 'Orthopedics',      phone: '+91 98765 43213', email: 'lowerparel@healthportal.com' },
  { id: '8',  name: 'Dr. Madh',                specialization: 'Orthopedics',      department: 'Orthopedics',      phone: '+91 98765 43223', email: 'madh@healthportal.com' },
  { id: '3',  name: 'Dr. Thane',               specialization: 'General Medicine', department: 'General Medicine', phone: '+91 98765 43211', email: 'thane@healthportal.com' },
  { id: '4',  name: 'Dr. Kurla',               specialization: 'General Medicine', department: 'General Medicine', phone: '+91 98765 43221', email: 'kurla@healthportal.com' },
  { id: '9',  name: 'Dr. Parel',               specialization: 'Mental Health',    department: 'Mental Health',    phone: '+91 98765 43214', email: 'parel@healthportal.com' },
  { id: '10', name: 'Dr. Goregaon',            specialization: 'Mental Health',    department: 'Mental Health',    phone: '+91 98765 43224', email: 'goregaon@healthportal.com' },
  { id: '11', name: 'Dr. Ghatkopar',           specialization: 'Dermatology',      department: 'Dermatology',      phone: '+91 98765 43216', email: 'ghatkopar@healthportal.com' },
  { id: '12', name: 'Dr. Matunga Road',        specialization: 'Dermatology',      department: 'Dermatology',      phone: '+91 98765 43225', email: 'matungaroad@healthportal.com' },
  { id: '13', name: 'Dr. Matunga',             specialization: 'Gynecology',       department: 'Gynecology',       phone: '+91 98765 43217', email: 'matunga@healthportal.com' },
  { id: '14', name: 'Dr. Wadala',              specialization: 'Gynecology',       department: 'Gynecology',       phone: '+91 98765 43226', email: 'wadala@healthportal.com' },
  { id: '15', name: 'Dr. Diva',                specialization: 'Dental',           department: 'Dental',           phone: '+91 98765 43218', email: 'diva@healthportal.com' },
  { id: '16', name: 'Dr. Nahur',               specialization: 'Dental',           department: 'Dental',           phone: '+91 98765 43227', email: 'nahur@healthportal.com' },
  { id: '17', name: 'Nurse Chinnapandyan Iyer',specialization: 'Nursing',          department: 'General Medicine', phone: '+91 98765 43215', email: 'nurse.iyer@healthportal.com' },
];

function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [activeDept, setActiveDept] = useState('all');
  const [formData, setFormData] = useState({ name: '', specialization: '', department: '', phone: '', email: '' });

  useEffect(() => { loadDoctors(); }, []);

  const loadDoctors = async () => {
    try { setDoctors(initialDoctors); }
    catch (error) { console.error('Error loading doctors:', error); }
    finally { setLoading(false); }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAdd = () => {
    if (!formData.name || !formData.specialization || !formData.department) { alert('Please fill all required fields'); return; }
    setDoctors([...doctors, { id: Date.now().toString(), ...formData }]);
    setFormData({ name: '', specialization: '', department: '', phone: '', email: '' });
    setShowAddForm(false);
  };

  const handleEdit = (doctor) => { setEditingDoctor(doctor); setFormData(doctor); setShowAddForm(true); };

  const handleUpdate = () => {
    setDoctors(doctors.map(d => d.id === editingDoctor.id ? { ...formData, id: editingDoctor.id } : d));
    setFormData({ name: '', specialization: '', department: '', phone: '', email: '' });
    setEditingDoctor(null); setShowAddForm(false);
  };

  const handleDelete = (doctorId) => {
    if (!confirm('Delete this doctor?')) return;
    setDoctors(doctors.filter(d => d.id !== doctorId));
  };

  const allDepts = ['all', ...departments, 'Nursing'];
  const filteredDoctors = activeDept === 'all' ? doctors : doctors.filter(d => d.department === activeDept);

  if (loading) return (
    <div className="adoc-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <style>{styles}</style>
      <div style={{ textAlign: 'center', color: '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></div>Loading doctors…
      </div>
    </div>
  );

  return (
    <div className="adoc-root">
      <style>{styles}</style>

      <div className="adoc-header">
        <div>
          <h1>Doctors Management</h1>
          <p>{doctors.length} staff across {new Set(doctors.map(d => d.department)).size} departments</p>
        </div>
        <button className="adoc-btn adoc-btn-primary" onClick={() => { setShowAddForm(!showAddForm); setEditingDoctor(null); setFormData({ name: '', specialization: '', department: '', phone: '', email: '' }); }}>
          {showAddForm ? '✕ Cancel' : '+ Add Doctor'}
        </button>
      </div>

      <div className="adoc-content">

        {/* Stats */}
        <div className="adoc-stats">
          {[
            { label: 'Total Staff',      value: doctors.length,                                          icon: '', bg: '#eff6ff', color: '#2563eb' },
            { label: 'Departments',      value: new Set(doctors.map(d => d.department)).size,            icon: '', bg: '#f0fdf4', color: '#16a34a' },
            { label: 'Specializations',  value: new Set(doctors.map(d => d.specialization)).size,       icon: '', bg: '#f0fdfa', color: '#0d9488' },
          ].map(s => (
            <div key={s.label} className="adoc-stat adoc-fadein">
              <div className="adoc-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div>
                <div className="adoc-stat-label">{s.label}</div>
                <div className="adoc-stat-value">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Add / Edit Form */}
        {showAddForm && (
          <div className="adoc-card adoc-fadein" style={{ marginBottom: '1.5rem' }}>
            <div className="adoc-card-header">
              <div>
                <h2 className="adoc-card-title">{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h2>
                <div className="adoc-divider" />
              </div>
              <button className="adoc-btn adoc-btn-secondary adoc-btn-sm" onClick={() => { setShowAddForm(false); setEditingDoctor(null); }}>Cancel</button>
            </div>
            <div className="adoc-card-body">
              <div className="adoc-form-grid">
                <div className="adoc-form-group">
                  <label className="adoc-form-label">Doctor Name *</label>
                  <input type="text" name="name" className="adoc-form-input" value={formData.name} onChange={handleInputChange} placeholder="Dr. Full Name" />
                </div>
                <div className="adoc-form-group">
                  <label className="adoc-form-label">Specialization *</label>
                  <input type="text" name="specialization" className="adoc-form-input" value={formData.specialization} onChange={handleInputChange} placeholder="e.g., Cardiologist" />
                </div>
                <div className="adoc-form-group">
                  <label className="adoc-form-label">Department *</label>
                  <select name="department" className="adoc-form-select" value={formData.department} onChange={handleInputChange}>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="adoc-form-group">
                  <label className="adoc-form-label">Phone</label>
                  <input type="tel" name="phone" className="adoc-form-input" value={formData.phone} onChange={handleInputChange} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="adoc-form-group full">
                  <label className="adoc-form-label">Email</label>
                  <input type="email" name="email" className="adoc-form-input" value={formData.email} onChange={handleInputChange} placeholder="doctor@healthportal.com" />
                </div>
              </div>
              <button className="adoc-btn adoc-btn-primary" style={{ marginTop: '1.25rem' }} onClick={editingDoctor ? handleUpdate : handleAdd}>
                {editingDoctor ? ' Update Doctor' : '+ Add Doctor'}
              </button>
            </div>
          </div>
        )}

        {/* Department filter */}
        <div className="adoc-dept-bar">
          {allDepts.map(d => (
            <button key={d} className={`adoc-dept-tab ${activeDept === d ? 'active' : ''}`} onClick={() => setActiveDept(d)}>
              {d === 'all' ? `All (${doctors.length})` : d}
            </button>
          ))}
        </div>

        {/* Doctor Cards */}
        <div className="adoc-card">
          <div className="adoc-card-header">
            <div>
              <h2 className="adoc-card-title">
                {activeDept === 'all' ? 'All Staff' : activeDept}
                <span style={{ font: '400 0.8rem DM Sans,sans-serif', color: '#94a3b8', marginLeft: '0.5rem' }}>({filteredDoctors.length})</span>
              </h2>
              <div className="adoc-divider" />
            </div>
          </div>

          {filteredDoctors.length === 0 ? (
            <div className="adoc-empty">
              <span className="adoc-empty-icon"></span>
              <div style={{ fontWeight: 600, color: '#475569' }}>No doctors in this department</div>
            </div>
          ) : (
            <div className="adoc-grid">
              {filteredDoctors.map(doctor => {
                const dc = deptColors[doctor.department] || deptColors['General Medicine'];
                return (
                  <div key={doctor.id} className="adoc-doctor-card adoc-fadein">
                    <div className="adoc-dept-badge" style={{ background: dc.bg, color: dc.color, border: `1px solid ${dc.border}` }}>
                      {doctor.department}
                    </div>
                    <div className="adoc-doctor-avatar">{getInitials(doctor.name)}</div>
                    <div className="adoc-doctor-name">{doctor.name}</div>
                    <div className="adoc-doctor-spec">{doctor.specialization}</div>
                    <div className="adoc-doctor-detail"> <span>{doctor.phone || '—'}</span></div>
                    <div className="adoc-doctor-detail"> <span style={{ wordBreak: 'break-all' }}>{doctor.email || '—'}</span></div>
                    <div className="adoc-doctor-actions">
                      <button className="adoc-btn adoc-btn-secondary adoc-btn-sm" style={{ flex: 1 }} onClick={() => handleEdit(doctor)}> Edit</button>
                      <button className="adoc-btn adoc-btn-danger adoc-btn-sm" style={{ flex: 1 }} onClick={() => handleDelete(doctor.id)}> Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDoctors;