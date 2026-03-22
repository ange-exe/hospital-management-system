import React from 'react';

function Home({ setCurrentPage }) {
  return (
    <div className="fade-in">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Health Portal</h1>
          <p>
            Your comprehensive healthcare companion. Access your medical records, schedule appointments, 
            and stay informed with the latest health information—all in one place.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => setCurrentPage('appointments')}>
              Schedule Appointment
            </button>
            <button className="btn btn-secondary" onClick={() => setCurrentPage('records')}>
              View Records
            </button>
          </div>
        </div>
      </section>

      <div className="features-grid">
        <div className="feature-card" onClick={() => setCurrentPage('records')}>
          <div className="feature-icon">📋</div>
          <h3>Medical Records</h3>
          <p>
            Access your complete medical history, test results, prescriptions, and treatment plans 
            anytime, anywhere.
          </p>
        </div>

        <div className="feature-card" onClick={() => setCurrentPage('appointments')}>
          <div className="feature-icon">📅</div>
          <h3>Easy Scheduling</h3>
          <p>
            Book appointments with healthcare providers at your convenience. Choose from available 
            time slots that fit your schedule.
          </p>
        </div>

        <div className="feature-card" onClick={() => setCurrentPage('maternal')}>
          <div className="feature-icon">👶</div>
          <h3>Maternal Care</h3>
          <p>
            Specialized support for expecting mothers with comprehensive prenatal and postnatal 
            care information and resources.
          </p>
        </div>

        <div className="feature-card" onClick={() => setCurrentPage('articles')}>
          <div className="feature-icon">📚</div>
          <h3>Health Resources</h3>
          <p>
            Stay informed with curated health articles, research updates, and wellness tips from 
            trusted medical professionals.
          </p>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Quick Stats</h2>
        <div className="info-grid">
          <div className="info-item">
            <div className="info-item-label">Total Visits</div>
            <div className="info-item-value">12</div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Upcoming Appointments</div>
            <div className="info-item-value">2</div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Active Prescriptions</div>
            <div className="info-item-value">3</div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Last Check-up</div>
            <div className="info-item-value">Jan 15, 2026</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
          Recent Announcements
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ 
            padding: '1.5rem', 
            background: 'var(--color-background)', 
            borderRadius: '12px',
            borderLeft: '4px solid var(--color-primary)'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--color-primary-dark)' }}>
              Flu Vaccination Campaign
            </div>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>
              Free flu shots available at the campus health center. Walk-ins welcome Monday through Friday, 9 AM - 4 PM.
            </p>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
              Posted: January 28, 2026
            </div>
          </div>
          
          <div style={{ 
            padding: '1.5rem', 
            background: 'var(--color-background)', 
            borderRadius: '12px',
            borderLeft: '4px solid var(--color-accent)'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--color-primary-dark)' }}>
              New Mental Health Resources
            </div>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>
              We've expanded our counseling services. Now offering same-day appointments for urgent mental health support.
            </p>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
              Posted: January 22, 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
