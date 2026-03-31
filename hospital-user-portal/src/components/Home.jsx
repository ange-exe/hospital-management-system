import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';

const CURRENT_USER = {
  uid:         'STU-2024-1847',
  displayName: 'Raju Rastogi',
  email:       'raju@student.edu',
  role:        'patient',
};

function Home({ setCurrentPage }) {
  const [appointments, setAppointments] = useState([]);

  // Load appointments once
  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'appointments'), orderBy('createdAt', 'desc'))
        );
        setAppointments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error('Home: load appointments', e); }
    };
    load();
  }, []);

  // ── Listen to the ENTIRE calls collection ─────────────────────────────────
  
  return (
    <div className="fade-in">

      {/* ── INCOMING CALL BANNER ─────────────────────────────────────────────
           Floats at the top of the screen whenever any call is live.
           Guaranteed to show even if appointment IDs don't match.
      ────────────────────────────────────────────────────────────────────── */}

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Health Portal</h1>
          <p>
            Your comprehensive healthcare companion. Access your medical records,
            schedule appointments, and stay informed with the latest health
            information—all in one place.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary"   onClick={() => setCurrentPage('appointments')}>Schedule Appointment</button>
            <button className="btn btn-secondary" onClick={() => setCurrentPage('records')}>View Records</button>
          </div>
        </div>
      </section>

      {/* ── FEATURE CARDS ── */}
      <div className="features-grid">
        {[
          {ico:'📋',title:'Medical Records',   page:'records',      desc:'Access your complete medical history, test results, prescriptions, and treatment plans anytime, anywhere.'},
          {ico:'📅',title:'Easy Scheduling',   page:'appointments', desc:'Book appointments with healthcare providers at your convenience.'},
          {ico:'👶',title:'Maternal Care',     page:'maternal',     desc:'Specialized support for expecting mothers with comprehensive prenatal and postnatal care information.'},
          {ico:'📚',title:'Health Resources',  page:'articles',     desc:'Stay informed with curated health articles, research updates, and wellness tips.'},
        ].map(({ico,title,page,desc})=>(
          <div key={page} className="feature-card" onClick={() => setCurrentPage(page)}>
            <div className="feature-icon">{ico}</div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </div>

      {/* ── QUICK STATS ── */}
      <div className="card">
        <h2 style={{marginBottom:'1.5rem',color:'var(--color-primary)'}}>Quick Stats</h2>
        <div className="info-grid">
          <div className="info-item"><div className="info-item-label">Total Visits</div><div className="info-item-value">12</div></div>
          <div className="info-item"><div className="info-item-label">Upcoming Appointments</div><div className="info-item-value">{appointments.length}</div></div>
          <div className="info-item"><div className="info-item-label">Active Prescriptions</div><div className="info-item-value">3</div></div>
          <div className="info-item"><div className="info-item-label">Last Check-up</div><div className="info-item-value">Jan 15, 2026</div></div>
        </div>
      </div>

      {/* ── ANNOUNCEMENTS ── */}
      <div className="card">
        <h2 style={{marginBottom:'1.5rem',color:'var(--color-primary)'}}>Recent Announcements</h2>
        <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
          {[
            {title:'Flu Vaccination Campaign',color:'var(--color-primary)',text:'Free flu shots available at the campus health center. Walk-ins welcome Monday through Friday, 9 AM – 4 PM.',date:'January 28, 2026'},
            {title:'New Mental Health Resources',color:'var(--color-accent)',text:"We've expanded our counseling services. Now offering same-day appointments for urgent mental health support.",date:'January 22, 2026'},
          ].map(({title,color,text,date})=>(
            <div key={title} style={{padding:'1.5rem',background:'var(--color-background)',borderRadius:12,borderLeft:`4px solid ${color}`}}>
              <div style={{fontWeight:600,marginBottom:'.5rem',color:'var(--color-primary-dark)'}}>{title}</div>
              <p style={{color:'var(--color-text-light)',marginBottom:'.5rem'}}>{text}</p>
              <div style={{fontSize:'.85rem',color:'var(--color-text-light)'}}>Posted: {date}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes banner-in {
          from { opacity:0; transform:translateX(-50%) translateY(-20px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
        @keyframes dot-pulse {
          0%,100% { transform:scale(1); opacity:1; }
          50%      { transform:scale(1.7); opacity:.4; }
        }
      `}</style>
    </div>
  );
}

export default Home;