import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

  .hp-home {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #faf8f4;
    min-height: 100vh;
    color: #1c3530;
  }

  /* ── Hero ── */
  .hp-hero {
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #1c3530 0%, #2d5a4f 50%, #3d7a6f 100%);
    padding: 5rem 2rem 4rem;
    text-align: center;
  }

  .hp-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 20% 80%, rgba(91,168,155,0.25) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(232,184,122,0.15) 0%, transparent 50%);
    pointer-events: none;
  }

  .hp-hero-deco {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }
  .hp-hero-deco-1 {
    width: 300px; height: 300px;
    top: -100px; right: -80px;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .hp-hero-deco-2 {
    width: 180px; height: 180px;
    bottom: -60px; left: 5%;
    border: 1px solid rgba(255,255,255,0.06);
  }

  .hp-hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 1rem;
    border-radius: 20px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    font-size: 0.78rem;
    font-weight: 600;
    color: rgba(255,255,255,0.75);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 1.5rem;
    position: relative;
  }

  .hp-hero h1 {
    font-family: 'Fraunces', serif;
    font-size: clamp(2.2rem, 5vw, 3.6rem);
    font-weight: 900;
    color: #fff;
    line-height: 1.1;
    margin: 0 0 1.25rem;
    letter-spacing: -0.02em;
    position: relative;
  }

  .hp-hero h1 em {
    font-style: italic;
    color: #8fd4c9;
  }

  .hp-hero p {
    font-size: 1.05rem;
    color: rgba(255,255,255,0.65);
    max-width: 540px;
    margin: 0 auto 2.5rem;
    line-height: 1.7;
    position: relative;
  }

  .hp-hero-btns {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    position: relative;
  }

  .hp-btn-primary {
    padding: 0.85rem 2rem;
    border-radius: 50px;
    background: linear-gradient(135deg, #e8b87a, #d4956a);
    color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 0.9rem;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 18px rgba(212,149,106,0.45);
    transition: all 0.2s;
    letter-spacing: 0.01em;
  }

  .hp-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(212,149,106,0.55);
  }

  .hp-btn-outline {
    padding: 0.85rem 2rem;
    border-radius: 50px;
    background: rgba(255,255,255,0.1);
    border: 1.5px solid rgba(255,255,255,0.25);
    color: rgba(255,255,255,0.9);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(4px);
  }

  .hp-btn-outline:hover {
    background: rgba(255,255,255,0.18);
    border-color: rgba(255,255,255,0.4);
  }

  /* ── Stats strip ── */
  .hp-stats-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    background: #fff;
    border-bottom: 1px solid rgba(61,122,111,0.1);
    box-shadow: 0 2px 12px rgba(28,53,48,0.06);
  }

  @media (max-width: 640px) { .hp-stats-strip { grid-template-columns: repeat(2,1fr); } }

  .hp-stat-cell {
    padding: 1.5rem 1.25rem;
    text-align: center;
    border-right: 1px solid rgba(61,122,111,0.08);
    position: relative;
    overflow: hidden;
    transition: background 0.2s;
  }

  .hp-stat-cell:last-child { border-right: none; }
  .hp-stat-cell:hover { background: rgba(61,122,111,0.03); }

  .hp-stat-num {
    font-family: 'Fraunces', serif;
    font-size: 2rem;
    font-weight: 700;
    color: #2d5a4f;
    line-height: 1;
    margin-bottom: 0.3rem;
  }

  .hp-stat-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: #8a9e99;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* ── Content area ── */
  .hp-content {
    max-width: 1100px;
    margin: 0 auto;
    padding: 3rem 2rem;
  }

  /* ── Section label ── */
  .hp-section-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .hp-section-label h2 {
    font-family: 'Fraunces', serif;
    font-size: 1.4rem;
    font-weight: 700;
    color: #1c3530;
    margin: 0;
    letter-spacing: -0.01em;
  }

  .hp-section-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(61,122,111,0.2), transparent);
  }

  /* ── Feature cards ── */
  .hp-features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
    margin-bottom: 3rem;
  }

  @media (max-width: 640px) { .hp-features { grid-template-columns: 1fr; } }

  .hp-feature-card {
    background: #fff;
    border-radius: 18px;
    padding: 1.75rem;
    border: 1px solid rgba(61,122,111,0.1);
    cursor: pointer;
    transition: all 0.22s;
    position: relative;
    overflow: hidden;
  }

  .hp-feature-card::before {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 80px; height: 80px;
    border-radius: 0 18px 0 100%;
    background: linear-gradient(135deg, rgba(61,122,111,0.06), transparent);
    transition: width 0.3s, height 0.3s;
  }

  .hp-feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 36px rgba(28,53,48,0.1);
    border-color: rgba(61,122,111,0.25);
  }

  .hp-feature-card:hover::before {
    width: 130px; height: 130px;
  }

  .hp-feature-icon {
    width: 46px;
    height: 46px;
    border-radius: 13px;
    background: linear-gradient(135deg, rgba(61,122,111,0.12), rgba(91,168,155,0.08));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .hp-feature-title {
    font-family: 'Fraunces', serif;
    font-size: 1.05rem;
    font-weight: 700;
    color: #1c3530;
    margin: 0 0 0.4rem;
  }

  .hp-feature-desc {
    font-size: 0.83rem;
    color: #7a8e89;
    line-height: 1.6;
    margin: 0;
  }

  .hp-feature-arrow {
    display: inline-flex;
    align-items: center;
    margin-top: 1rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: #3d7a6f;
    gap: 0.25rem;
    transition: gap 0.18s;
  }

  .hp-feature-card:hover .hp-feature-arrow { gap: 0.5rem; }

  /* ── Announcements ── */
  .hp-announcements {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 3rem;
  }

  .hp-announcement {
    background: #fff;
    border-radius: 14px;
    padding: 1.25rem 1.5rem;
    border: 1px solid rgba(61,122,111,0.1);
    border-left: 3px solid #3d7a6f;
    transition: all 0.18s;
    cursor: default;
  }

  .hp-announcement:nth-child(2) { border-left-color: #e8b87a; }

  .hp-announcement:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 18px rgba(28,53,48,0.07);
  }

  .hp-ann-title {
    font-family: 'Fraunces', serif;
    font-size: 1rem;
    font-weight: 600;
    color: #1c3530;
    margin: 0 0 0.35rem;
  }

  .hp-ann-text {
    font-size: 0.85rem;
    color: #7a8e89;
    line-height: 1.6;
    margin: 0 0 0.5rem;
  }

  .hp-ann-date {
    font-size: 0.75rem;
    color: #a0b5b0;
    font-weight: 500;
  }

  /* animations */
  @keyframes hpFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .hp-fadein { animation: hpFadeUp 0.45s ease both; }
  .hp-d1 { animation-delay: 0.05s; }
  .hp-d2 { animation-delay: 0.1s; }
  .hp-d3 { animation-delay: 0.15s; }
  .hp-d4 { animation-delay: 0.2s; }
  .hp-d5 { animation-delay: 0.25s; }
`;

const CURRENT_USER = {
  uid:         'STU-2024-1847',
  displayName: 'Raju Rastogi',
  email:       'raju@student.edu',
  role:        'patient',
};

function Home({ setCurrentPage }) {
  const [appointments, setAppointments] = useState([]);

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

  const features = [
    { ico: '', title: 'Medical Records',  page: 'records',      desc: 'Access your complete medical history, test results, prescriptions, and treatment plans anytime.' },
    { ico: '', title: 'Easy Scheduling',  page: 'appointments', desc: 'Book appointments with healthcare providers at your convenience, including urgent care.' },
    { ico: '', title: 'Receipts',         page: 'receipts',     desc: 'View your billing history, payment status, and itemized receipts for all past visits.' },
    { ico: '', title: 'Health Resources', page: 'articles',     desc: 'Stay informed with curated health articles, research updates, and wellness tips.' },
  ];

  const announcements = [
    { title: 'Flu Vaccination Campaign', text: 'Free flu shots available at the campus health center. Walk-ins welcome Monday – Friday, 9 AM – 4 PM.', date: 'January 28, 2026' },
    { title: 'New Mental Health Resources', text: "We've expanded our counseling services. Now offering same-day appointments for urgent mental health support.", date: 'January 22, 2026' },
  ];

  return (
    <div className="hp-home">
      <style>{styles}</style>

      {/* Hero */}
      <section className="hp-hero">
        <div className="hp-hero-deco hp-hero-deco-1" />
        <div className="hp-hero-deco hp-hero-deco-2" />

        <div className="hp-hero-eyebrow">
          <span>🌿</span> Your Health, Your Way
        </div>
        <h1>Welcome back,<br /><em>Raju.</em></h1>
        <p>Your comprehensive healthcare companion — manage records, schedule visits, and stay informed all in one place.</p>
        <div className="hp-hero-btns">
          <button className="hp-btn-primary" onClick={() => setCurrentPage('appointments')}>
            Schedule Appointment →
          </button>
          <button className="hp-btn-outline" onClick={() => setCurrentPage('records')}>
            View Records
          </button>
        </div>
      </section>

      {/* Stats strip */}
      <div className="hp-stats-strip hp-fadein">
        {[
          { num: '12',                label: 'Total Visits' },
          { num: appointments.length, label: 'Upcoming' },
          { num: '3',                 label: 'Prescriptions' },
          { num: 'Jan 15',            label: 'Last Check-up' },
        ].map((s) => (
          <div key={s.label} className="hp-stat-cell">
            <div className="hp-stat-num">{s.num}</div>
            <div className="hp-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="hp-content">

        {/* Announcements */}
        <div className="hp-section-label hp-fadein hp-d1">
          <h2>Announcements</h2>
          <div className="hp-section-line" />
        </div>

        <div className="hp-announcements hp-fadein hp-d2">
          {announcements.map(({ title, text, date }) => (
            <div key={title} className="hp-announcement">
              <div className="hp-ann-title">{title}</div>
              <p className="hp-ann-text">{text}</p>
              <div className="hp-ann-date">Posted {date}</div>
            </div>
          ))}
        </div>

        {/* Quick Access */}
        <div className="hp-section-label hp-fadein hp-d3">
          <h2>Quick Access</h2>
          <div className="hp-section-line" />
        </div>

        <div className="hp-features hp-fadein hp-d4">
          {features.map(({ ico, title, page, desc }) => (
            <div key={page} className="hp-feature-card" onClick={() => setCurrentPage(page)}>
              <div className="hp-feature-icon">{ico}</div>
              <div className="hp-feature-title">{title}</div>
              <p className="hp-feature-desc">{desc}</p>
              <span className="hp-feature-arrow">Explore <span>→</span></span>
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