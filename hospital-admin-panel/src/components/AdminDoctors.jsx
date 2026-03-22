import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    department: '',
    phone: '',
    email: ''
  });

  // Initial doctors list (hardcoded for now)
 const initialDoctors = [
    // Cardiology
    { id: '1', name: 'Dr. Bhandup', specialization: 'Cardiology', department: 'Cardiology', phone: '+91 98765 43210', email: 'bhandup@healthportal.com' },
    { id: '2', name: 'Dr. Dadar', specialization: 'Cardiology', department: 'Cardiology', phone: '+91 98765 43220', email: 'dadar@healthportal.com' },
    
    // Pediatrics
    { id: '5', name: 'Dr. Andheri', specialization: 'Pediatrics', department: 'Pediatrics', phone: '+91 98765 43212', email: 'andheri@healthportal.com' },
    { id: '6', name: 'Dr. Sion', specialization: 'Pediatrics', department: 'Pediatrics', phone: '+91 98765 43222', email: 'sion@healthportal.com' },
    
    // Orthopedics
    { id: '7', name: 'Dr. Lower Parel', specialization: 'Orthopedics', department: 'Orthopedics', phone: '+91 98765 43213', email: 'lowerparel@healthportal.com' },
    { id: '8', name: 'Dr. Madh', specialization: 'Orthopedics', department: 'Orthopedics', phone: '+91 98765 43223', email: 'madh@healthportal.com' },
    
    // General Medicine
    { id: '3', name: 'Dr. Thane', specialization: 'General Medicine', department: 'General Medicine', phone: '+91 98765 43211', email: 'thane@healthportal.com' },
    { id: '4', name: 'Dr. Kurla', specialization: 'General Medicine', department: 'General Medicine', phone: '+91 98765 43221', email: 'kurla@healthportal.com' },
    
    // Mental Health
    { id: '9', name: 'Dr. Parel', specialization: 'Mental Health', department: 'Mental Health', phone: '+91 98765 43214', email: 'parel@healthportal.com' },
    { id: '10', name: 'Dr. Goregaon', specialization: 'Mental Health', department: 'Mental Health', phone: '+91 98765 43224', email: 'goregaon@healthportal.com' },
    
    // Dermatology
    { id: '11', name: 'Dr. Ghatkopar', specialization: 'Dermatology', department: 'Dermatology', phone: '+91 98765 43216', email: 'ghatkopar@healthportal.com' },
    { id: '12', name: 'Dr. Matunga Road', specialization: 'Dermatology', department: 'Dermatology', phone: '+91 98765 43225', email: 'matungaroad@healthportal.com' },
    
    // Gynecology
    { id: '13', name: 'Dr. Matunga', specialization: 'Gynecology', department: 'Gynecology', phone: '+91 98765 43217', email: 'matunga@healthportal.com' },
    { id: '14', name: 'Dr. Wadala', specialization: 'Gynecology', department: 'Gynecology', phone: '+91 98765 43226', email: 'wadala@healthportal.com' },
    
    // Dental
    { id: '15', name: 'Dr. Diva', specialization: 'Dental', department: 'Dental', phone: '+91 98765 43218', email: 'diva@healthportal.com' },
    { id: '16', name: 'Dr. Nahur', specialization: 'Dental', department: 'Dental', phone: '+91 98765 43227', email: 'nahur@healthportal.com' },
    
    // Nursing
    { id: '17', name: 'Nurse Chinnapandyan Iyer', specialization: 'Nursing', department: 'General Medicine', phone: '+91 98765 43215', email: 'nurse.iyer@healthportal.com' },
  ];

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      // For now, use local state
      // Later: fetch from Firebase 'doctors' collection
      setDoctors(initialDoctors);
      setLoading(false);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAdd = () => {
    // Validate
    if (!formData.name || !formData.specialization || !formData.department) {
      alert('Please fill all required fields');
      return;
    }

    const newDoctor = {
      id: Date.now().toString(),
      ...formData
    };

    setDoctors([...doctors, newDoctor]);
    setFormData({ name: '', specialization: '', department: '', phone: '', email: '' });
    setShowAddForm(false);
    alert('✅ Doctor added successfully!');
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setFormData(doctor);
    setShowAddForm(true);
  };

  const handleUpdate = () => {
    const updatedDoctors = doctors.map(doc => 
      doc.id === editingDoctor.id ? { ...formData, id: editingDoctor.id } : doc
    );
    setDoctors(updatedDoctors);
    setFormData({ name: '', specialization: '', department: '', phone: '', email: '' });
    setEditingDoctor(null);
    setShowAddForm(false);
    alert('✅ Doctor updated successfully!');
  };

  const handleDelete = (doctorId) => {
    if (!confirm('Delete this doctor? This action cannot be undone.')) return;
    
    setDoctors(doctors.filter(doc => doc.id !== doctorId));
    alert('✅ Doctor deleted successfully!');
  };

  if (loading) {
    return <div className="loading">Loading doctors...</div>;
  }

  return (
    <div className="fade-in">
      <div className="admin-header">
        <h1>Doctors Management</h1>
        <div className="admin-header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => {
              setShowAddForm(true);
              setEditingDoctor(null);
              setFormData({ name: '', specialization: '', department: '', phone: '', email: '' });
            }}
          >
            + Add Doctor
          </button>
        </div>
      </div>

      <div className="admin-content">
        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-card-title">Total Doctors</div>
            <div className="stat-card-value">{doctors.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-title">Departments</div>
            <div className="stat-card-value">
              {new Set(doctors.map(d => d.department)).size}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-title">Specializations</div>
            <div className="stat-card-value">
              {new Set(doctors.map(d => d.specialization)).size}
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="admin-card" style={{ marginBottom: '2rem' }}>
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
              </h2>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingDoctor(null);
                  setFormData({ name: '', specialization: '', department: '', phone: '', email: '' });
                }}
              >
                Cancel
              </button>
            </div>
            <div className="admin-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Doctor Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Dr. Full Name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Specialization *</label>
                  <input
                    type="text"
                    name="specialization"
                    className="form-input"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    placeholder="e.g., Cardiologist"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select
                    name="department"
                    className="form-select"
                    value={formData.department}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Department</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Mental Health">Mental Health</option>
                    <option value="Gynecology">Gynecology</option>
                    <option value="Dental">Dental</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="doctor@healthportal.com"
                  />
                </div>
              </div>

              <button 
                className="btn btn-primary"
                onClick={editingDoctor ? handleUpdate : handleAdd}
              >
                {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
              </button>
            </div>
          </div>
        )}

        {/* Doctors List */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">All Doctors ({doctors.length})</h2>
          </div>
          <div className="admin-card-body" style={{ padding: 0 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Department</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td style={{ fontWeight: 600 }}>{doctor.name}</td>
                    <td>{doctor.specialization}</td>
                    <td>{doctor.department}</td>
                    <td>{doctor.phone}</td>
                    <td>{doctor.email}</td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn btn-secondary"
                          onClick={() => handleEdit(doctor)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDelete(doctor.id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDoctors;
