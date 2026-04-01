import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import CategoryCover from './CategoryCover';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

  .ha-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #faf8f4;
    min-height: 100vh;
    color: #1c3530;
    padding-bottom: 4rem;
  }

  .ha-page-header {
    padding: 2.5rem 2rem 0;
    max-width: 1100px;
    margin: 0 auto;
  }

  .ha-page-header h1 {
    font-family: 'Fraunces', serif;
    font-size: 2rem;
    font-weight: 900;
    color: #1c3530;
    margin: 0 0 0.25rem;
    letter-spacing: -0.02em;
  }

  .ha-page-header p { font-size: 0.9rem; color: #7a8e89; margin: 0 0 2rem; }

  .ha-content {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  /* ── Category pills ── */
  .ha-filter-bar {
    background: #fff;
    border-radius: 16px;
    border: 1px solid rgba(61,122,111,0.12);
    padding: 1.1rem 1.25rem;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 2.5rem;
    box-shadow: 0 2px 8px rgba(28,53,48,0.04);
  }

  .ha-filter-pill {
    padding: 0.45rem 1rem;
    border-radius: 50px;
    border: 1.5px solid rgba(61,122,111,0.2);
    background: transparent;
    color: #5a7a74;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s;
    white-space: nowrap;
  }

  .ha-filter-pill:hover {
    background: rgba(61,122,111,0.07);
    color: #2d5a4f;
    border-color: rgba(61,122,111,0.35);
  }

  .ha-filter-pill.active {
    background: #2d5a4f;
    color: #fff;
    border-color: #2d5a4f;
    box-shadow: 0 2px 10px rgba(45,90,79,0.25);
  }

  /* ── Research card ── */
  .ha-card {
    background: #fff;
    border-radius: 18px;
    border: 1px solid rgba(61,122,111,0.12);
    box-shadow: 0 2px 12px rgba(28,53,48,0.05);
    margin-bottom: 2.5rem;
    overflow: hidden;
  }

  .ha-card-header {
    padding: 1.4rem 1.75rem 1rem;
    border-bottom: 1px solid #f2f5f4;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .ha-card-title {
    font-family: 'Fraunces', serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #1c3530;
    margin: 0;
  }

  .ha-badge-new {
    padding: 0.25rem 0.7rem;
    border-radius: 20px;
    background: #dcfce7;
    color: #15803d;
    font-size: 0.7rem;
    font-weight: 700;
  }

  .ha-research-item {
    padding: 1.25rem 1.75rem;
    border-bottom: 1px solid #f2f5f4;
    cursor: pointer;
    transition: all 0.18s;
  }

  .ha-research-item:last-child { border-bottom: none; }

  .ha-research-item:hover {
    background: rgba(61,122,111,0.025);
    transform: translateX(4px);
  }

  .ha-research-title {
    font-family: 'Fraunces', serif;
    font-size: 1rem;
    font-weight: 600;
    color: #1c3530;
    margin: 0 0 0.4rem;
  }

  .ha-research-meta {
    display: flex;
    gap: 1.25rem;
    font-size: 0.77rem;
    color: #a0b5b0;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .ha-research-summary { font-size: 0.85rem; color: #5a7a74; line-height: 1.65; margin: 0; }

  /* ── Section heading ── */
  .ha-section-label {
    display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;
  }

  .ha-section-label h2 {
    font-family: 'Fraunces', serif;
    font-size: 1.4rem; font-weight: 700; color: #1c3530;
    margin: 0; letter-spacing: -0.01em;
  }

  .ha-section-count {
    font-size: 0.78rem;
    color: #a0b5b0;
    font-weight: 500;
  }

  .ha-section-line { flex: 1; height: 1px; background: linear-gradient(90deg, rgba(61,122,111,0.18), transparent); }

  /* ── Article grid ── */
  .ha-articles-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
    margin-bottom: 3rem;
  }

  @media (max-width: 900px) { .ha-articles-grid { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 580px) { .ha-articles-grid { grid-template-columns: 1fr; } }

  .ha-article-card {
    background: #fff;
    border-radius: 16px;
    border: 1px solid rgba(61,122,111,0.1);
    overflow: hidden;
    transition: all 0.22s;
    display: flex;
    flex-direction: column;
  }

  .ha-article-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(28,53,48,0.1);
    border-color: rgba(61,122,111,0.25);
  }

  .ha-article-content {
    padding: 1.25rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .ha-article-meta {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.72rem;
    color: #a0b5b0;
    font-weight: 600;
    margin-bottom: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .ha-article-cat {
    color: #3d7a6f;
  }

  .ha-article-title {
    font-family: 'Fraunces', serif;
    font-size: 0.98rem;
    font-weight: 700;
    color: #1c3530;
    margin: 0 0 0.5rem;
    line-height: 1.35;
  }

  .ha-article-excerpt {
    font-size: 0.8rem;
    color: #7a8e89;
    line-height: 1.6;
    flex: 1;
    margin: 0 0 1rem;
  }

  .ha-article-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.78rem;
  }

  .ha-article-author { color: #5a7a74; font-weight: 600; }
  .ha-article-date   { color: #a0b5b0; }

  .ha-read-more {
    font-size: 0.78rem;
    font-weight: 700;
    color: #3d7a6f;
    text-decoration: none;
    transition: gap 0.15s;
  }

  .ha-read-more:hover { text-decoration: underline; }

  /* ── Newsletter ── */
  .ha-newsletter {
    background: linear-gradient(135deg, #1c3530, #2d5a4f, #3d7a6f);
    border-radius: 20px;
    padding: 3rem 2rem;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .ha-newsletter::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 250px; height: 250px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
    pointer-events: none;
  }

  .ha-newsletter h2 {
    font-family: 'Fraunces', serif;
    font-size: 1.75rem;
    font-weight: 900;
    color: #fff;
    margin: 0 0 0.75rem;
    position: relative;
    letter-spacing: -0.02em;
  }

  .ha-newsletter p {
    font-size: 0.9rem;
    color: rgba(255,255,255,0.65);
    max-width: 480px;
    margin: 0 auto 2rem;
    line-height: 1.7;
    position: relative;
  }

  .ha-newsletter-form {
    display: flex;
    gap: 0.75rem;
    max-width: 440px;
    margin: 0 auto;
    flex-wrap: wrap;
    justify-content: center;
    position: relative;
  }

  .ha-newsletter-input {
    flex: 1;
    min-width: 220px;
    padding: 0.8rem 1.25rem;
    border-radius: 50px;
    border: none;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    color: #1c3530;
    background: rgba(255,255,255,0.95);
    outline: none;
  }

  .ha-newsletter-btn {
    padding: 0.8rem 1.75rem;
    border-radius: 50px;
    border: none;
    background: linear-gradient(135deg, #e8b87a, #d4956a);
    color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 0.875rem;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(212,149,106,0.4);
    transition: all 0.2s;
    white-space: nowrap;
  }

  .ha-newsletter-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(212,149,106,0.5);
  }
`;

function HealthArticles() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [firebaseArticles, setFirebaseArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    'All Articles', 'Maternal & Infant Care', 'Mental Health', 'Nutrition',
    'Fitness', 'Disease Prevention', 'Sleep Health', 'Campus Wellness'
  ];

  const maternalArticles = [
    { id: 101, title: "First Trimester Care: What to Expect", category: "Maternal & Infant Care", date: "February 1, 2026", author: "Dr. Vikhroli", readTime: "8 min read", excerpt: "Essential information for the first 12 weeks of pregnancy, including prenatal vitamins, nutrition guidelines, common symptoms, and when to contact your healthcare provider.", icon: "🤰" },
    { id: 102, title: "Preparing for Labor and Delivery", category: "Maternal & Infant Care", date: "January 28, 2026", author: "Dr. Mulund", readTime: "10 min read", excerpt: "Everything you need to know about labor stages, pain management options, creating your birth plan, and what to pack for the hospital.", icon: "🏥" },
    { id: 103, title: "Breastfeeding Basics for New Mothers", category: "Maternal & Infant Care", date: "January 25, 2026", author: "Lactation Consultant Matunga", readTime: "7 min read", excerpt: "A comprehensive guide to breastfeeding techniques, proper latch, common challenges like engorgement and mastitis, and when to seek lactation support.", icon: "👶" },
    { id: 104, title: "Postpartum Care: The Fourth Trimester", category: "Maternal & Infant Care", date: "January 22, 2026", author: "Dr. Vikhroli", readTime: "9 min read", excerpt: "Recovery after childbirth, managing postpartum bleeding, emotional changes, when to resume activities, and recognizing signs of postpartum depression.", icon: "💝" },
    { id: 105, title: "Baby's First Year: Developmental Milestones", category: "Maternal & Infant Care", date: "January 18, 2026", author: "Dr. Andheri", readTime: "6 min read", excerpt: "Track your baby's growth and development with this month-by-month guide to important physical, cognitive, and social milestones in the first year.", icon: "🍼" },
    { id: 106, title: "Prenatal Nutrition: Eating for Two", category: "Maternal & Infant Care", date: "January 15, 2026", author: "Nutritionist Thumper Thompson", readTime: "7 min read", excerpt: "What to eat during pregnancy, foods to avoid, supplement recommendations, managing morning sickness, and maintaining healthy weight gain.", icon: "🥗" },
  ];

  const generalArticles = [
    { id: 1, title: "Managing Academic Stress: A Student's Guide", category: "Mental Health", date: "January 28, 2026", author: "Dr. Dadar", readTime: "5 min read", excerpt: "Learn evidence-based strategies for managing academic pressure, including time management techniques, mindfulness practices, and when to seek professional help.", icon: "🧠" },
    { id: 2, title: "Sleep Hygiene for College Students", category: "Sleep Health", date: "January 25, 2026", author: "Dr. Thane", readTime: "4 min read", excerpt: "Quality sleep is essential for academic performance and overall health. Discover practical tips to improve your sleep schedule despite a busy college lifestyle.", icon: "😴" },
    { id: 3, title: "Nutrition on a Budget: Healthy Eating in College", category: "Nutrition", date: "January 22, 2026", author: "Nutritionist Thumper Thompson", readTime: "6 min read", excerpt: "Eating healthy doesn't have to break the bank. Learn how to plan nutritious meals, smart grocery shopping, and quick recipes for busy students.", icon: "🥗" },
    { id: 4, title: "Understanding Seasonal Affective Disorder", category: "Mental Health", date: "January 18, 2026", author: "Dr. Bhandup", readTime: "7 min read", excerpt: "As winter months affect our mood and energy, learn about SAD, its symptoms, and effective treatments including light therapy and lifestyle modifications.", icon: "🌤️" },
    { id: 5, title: "Campus Fitness: Making the Most of University Resources", category: "Fitness", date: "January 15, 2026", author: "Fitness Coordinator Lower Parel", readTime: "5 min read", excerpt: "Your campus offers amazing fitness resources often included in tuition. Discover gym facilities, group classes, intramural sports, and outdoor activities.", icon: "🏃‍♀️" },
    { id: 6, title: "Flu Season: Prevention and Treatment", category: "Disease Prevention", date: "January 12, 2026", author: "Dr. Bhandup", readTime: "6 min read", excerpt: "Understanding influenza transmission, vaccination benefits, and what to do if you catch the flu. Plus, distinguishing flu from common cold symptoms.", icon: "💉" },
    { id: 7, title: "Digital Wellness: Managing Screen Time", category: "Campus Wellness", date: "January 10, 2026", author: "Dr. Andheri", readTime: "5 min read", excerpt: "In our digital age, excessive screen time affects mental health, sleep, and productivity. Learn strategies to maintain a healthy relationship with technology.", icon: "📱" },
    { id: 8, title: "Understanding and Preventing Athletic Injuries", category: "Fitness", date: "January 8, 2026", author: "Dr. Lower Parel", readTime: "8 min read", excerpt: "Common sports injuries among students, proper warm-up techniques, recovery strategies, and when to seek medical attention for sports-related pain.", icon: "⚽" },
    { id: 9, title: "Mindful Eating: Beyond Diet Culture", category: "Nutrition", date: "January 5, 2026", author: "Nutritionist Thumper Thompson", readTime: "6 min read", excerpt: "Moving away from restrictive dieting towards intuitive eating. Learn to listen to your body's hunger cues and develop a positive relationship with food.", icon: "🍎" },
    { id: 10, title: "Building Healthy Relationships in College", category: "Mental Health", date: "January 2, 2026", author: "Dr. Andheri", readTime: "7 min read", excerpt: "Navigate friendships, romantic relationships, and family dynamics during college years. Recognizing healthy vs. unhealthy relationship patterns.", icon: "💝" },
    { id: 11, title: "Preventing Common Campus Illnesses", category: "Disease Prevention", date: "December 28, 2025", author: "Dr. Thane", readTime: "5 min read", excerpt: "Living in close quarters increases illness transmission. Learn about common campus infections, prevention strategies, and maintaining a healthy dorm environment.", icon: "🦠" },
    { id: 12, title: "Study Break Stretches: Desk Yoga for Students", category: "Fitness", date: "December 22, 2025", author: "Yoga Instructor Bruce Lee", readTime: "4 min read", excerpt: "Combat the physical strain of long study sessions with simple stretches and yoga poses you can do at your desk or in the library.", icon: "🧘‍♀️" },
  ];

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'healthArticles'), (snap) => {
      setFirebaseArticles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => { console.error(err); setLoading(false); });
    return () => unsub();
  }, []);

  const allArticles = [...maternalArticles, ...generalArticles, ...firebaseArticles];
  const filtered = selectedCategory === 'all' ? allArticles : allArticles.filter(a => a.category === selectedCategory);

  const researchUpdates = [
    { title: "New Study Links Sleep Patterns to Academic Performance", source: "Journal of College Health", date: "January 2026", summary: "Recent research demonstrates strong correlation between consistent sleep schedules and improved GPA among college students." },
    { title: "Mental Health Screening Tools Improved with AI", source: "American Psychiatric Association", date: "December 2025", summary: "Artificial intelligence enhancing early detection of depression and anxiety in young adults through digital health platforms." },
    { title: "Plant-Based Diets Show Promise in Reducing Inflammation", source: "Nutrition Research", date: "December 2025", summary: "Long-term study reveals significant anti-inflammatory benefits of predominantly plant-based eating patterns." },
  ];

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#7a8e89' }}>Loading articles…</div>;

  return (
    <div className="ha-root">
      <style>{styles}</style>

      <div className="ha-page-header">
        <h1>Health Articles & Research</h1>
        <p>Stay informed with expert health information and the latest medical research</p>
      </div>

      <div className="ha-content">

        {/* Filter pills */}
        <div className="ha-filter-bar">
          {categories.map((cat) => {
            const val = cat === 'All Articles' ? 'all' : cat;
            return (
              <button
                key={cat}
                className={`ha-filter-pill ${selectedCategory === val ? 'active' : ''}`}
                onClick={() => setSelectedCategory(val)}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Research updates */}
        <div className="ha-card">
          <div className="ha-card-header">
            <h2 className="ha-card-title">Latest Research Updates</h2>
            <span className="ha-badge-new">New</span>
          </div>
          {researchUpdates.map((r) => (
            <div key={r.title} className="ha-research-item">
              <div className="ha-research-title">{r.title}</div>
              <div className="ha-research-meta">
                <span> {r.source}</span>
                <span>🗓 {r.date}</span>
              </div>
              <p className="ha-research-summary">{r.summary}</p>
            </div>
          ))}
        </div>

        {/* Articles */}
        <div className="ha-section-label">
          <h2>{selectedCategory === 'all' ? 'All Articles' : selectedCategory}</h2>
          <span className="ha-section-count">{filtered.length} {filtered.length === 1 ? 'article' : 'articles'}</span>
          <div className="ha-section-line" />
        </div>

        <div className="ha-articles-grid">
          {filtered.map((article) => (
            <div key={article.id} className="ha-article-card">
              <CategoryCover category={article.category} size="card" />
              <div className="ha-article-content">
                <div className="ha-article-meta">
                  <span className="ha-article-cat">{article.category}</span>
                  <span>·</span>
                  <span>{article.readTime}</span>
                </div>
                <div className="ha-article-title">{article.title}</div>
                <p className="ha-article-excerpt">{article.excerpt}</p>
                <div className="ha-article-footer">
                  <div>
                    <div className="ha-article-author">{article.author}</div>
                    <div className="ha-article-date">{article.date}</div>
                  </div>
                  <a href="#" className="ha-read-more">Read More →</a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="ha-newsletter">
          <h2>Stay Updated with Health Tips</h2>
          <p>Subscribe to our weekly newsletter for the latest health articles, wellness tips, and campus health news delivered to your inbox.</p>
          <div className="ha-newsletter-form">
            <input type="email" placeholder="Enter your email address" className="ha-newsletter-input" />
            <button className="ha-newsletter-btn">Subscribe</button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default HealthArticles;