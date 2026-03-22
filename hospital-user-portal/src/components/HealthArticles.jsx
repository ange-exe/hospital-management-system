import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function HealthArticles() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [firebaseArticles, setFirebaseArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    'All Articles',
    'Maternal & Infant Care',
    'Mental Health',
    'Nutrition',
    'Fitness',
    'Disease Prevention',
    'Sleep Health',
    'Campus Wellness'
  ];

  // MATERNAL & INFANT CARE ARTICLES
  const maternalArticles = [
    {
      id: 101,
      title: "First Trimester Care: What to Expect",
      category: "Maternal & Infant Care",
      date: "February 1, 2026",
      author: "Dr. Vikhroli",
      readTime: "8 min read",
      excerpt: "Essential information for the first 12 weeks of pregnancy, including prenatal vitamins, nutrition guidelines, common symptoms, and when to contact your healthcare provider.",
      icon: "🤰"
    },
    {
      id: 102,
      title: "Preparing for Labor and Delivery",
      category: "Maternal & Infant Care",
      date: "January 28, 2026",
      author: "Dr. Mulund",
      readTime: "10 min read",
      excerpt: "Everything you need to know about labor stages, pain management options, creating your birth plan, and what to pack for the hospital.",
      icon: "🏥"
    },
    {
      id: 103,
      title: "Breastfeeding Basics for New Mothers",
      category: "Maternal & Infant Care",
      date: "January 25, 2026",
      author: "Lactation Consultant Matunga",
      readTime: "7 min read",
      excerpt: "A comprehensive guide to breastfeeding techniques, proper latch, common challenges like engorgement and mastitis, and when to seek lactation support.",
      icon: "👶"
    },
    {
      id: 104,
      title: "Postpartum Care: The Fourth Trimester",
      category: "Maternal & Infant Care",
      date: "January 22, 2026",
      author: "Dr. Vikhroli",
      readTime: "9 min read",
      excerpt: "Recovery after childbirth, managing postpartum bleeding, emotional changes, when to resume activities, and recognizing signs of postpartum depression.",
      icon: "💝"
    },
    {
      id: 105,
      title: "Baby's First Year: Developmental Milestones",
      category: "Maternal & Infant Care",
      date: "January 18, 2026",
      author: "Dr. Andheri",
      readTime: "6 min read",
      excerpt: "Track your baby's growth and development with this month-by-month guide to important physical, cognitive, and social milestones in the first year.",
      icon: "🍼"
    },
    {
      id: 106,
      title: "Prenatal Nutrition: Eating for Two",
      category: "Maternal & Infant Care",
      date: "January 15, 2026",
      author: "Nutritionist Thumper Thompson",
      readTime: "7 min read",
      excerpt: "What to eat during pregnancy, foods to avoid, supplement recommendations, managing morning sickness, and maintaining healthy weight gain.",
      icon: "🥗"
    }
  ];

  // GENERAL HEALTH ARTICLES
  const generalArticles = [
    {
      id: 1,
      title: "Managing Academic Stress: A Student's Guide",
      category: "Mental Health",
      date: "January 28, 2026",
      author: "Dr. Dadar",
      readTime: "5 min read",
      excerpt: "Learn evidence-based strategies for managing academic pressure, including time management techniques, mindfulness practices, and when to seek professional help.",
      icon: "🧠"
    },
    {
      id: 2,
      title: "Sleep Hygiene for College Students",
      category: "Sleep Health",
      date: "January 25, 2026",
      author: "Dr. Thane",
      readTime: "4 min read",
      excerpt: "Quality sleep is essential for academic performance and overall health. Discover practical tips to improve your sleep schedule despite a busy college lifestyle.",
      icon: "😴"
    },
    {
      id: 3,
      title: "Nutrition on a Budget: Healthy Eating in College",
      category: "Nutrition",
      date: "January 22, 2026",
      author: "Nutritionist Thumper Thompson",
      readTime: "6 min read",
      excerpt: "Eating healthy doesn't have to break the bank. Learn how to plan nutritious meals, smart grocery shopping, and quick recipes for busy students.",
      icon: "🥗"
    },
    {
      id: 4,
      title: "Understanding Seasonal Affective Disorder",
      category: "Mental Health",
      date: "January 18, 2026",
      author: "Dr. Bhandup",
      readTime: "7 min read",
      excerpt: "As winter months affect our mood and energy, learn about SAD, its symptoms, and effective treatments including light therapy and lifestyle modifications.",
      icon: "🌤️"
    },
    {
      id: 5,
      title: "Campus Fitness: Making the Most of University Resources",
      category: "Fitness",
      date: "January 15, 2026",
      author: "Fitness Coordinator Lower Parel",
      readTime: "5 min read",
      excerpt: "Your campus offers amazing fitness resources often included in tuition. Discover gym facilities, group classes, intramural sports, and outdoor activities.",
      icon: "🏃‍♀️"
    },
    {
      id: 6,
      title: "Flu Season: Prevention and Treatment",
      category: "Disease Prevention",
      date: "January 12, 2026",
      author: "Dr. Bhandup",
      readTime: "6 min read",
      excerpt: "Understanding influenza transmission, vaccination benefits, and what to do if you catch the flu. Plus, distinguishing flu from common cold symptoms.",
      icon: "💉"
    },
    {
      id: 7,
      title: "Digital Wellness: Managing Screen Time",
      category: "Campus Wellness",
      date: "January 10, 2026",
      author: "Dr. Andheri",
      readTime: "5 min read",
      excerpt: "In our digital age, excessive screen time affects mental health, sleep, and productivity. Learn strategies to maintain a healthy relationship with technology.",
      icon: "📱"
    },
    {
      id: 8,
      title: "Understanding and Preventing Athletic Injuries",
      category: "Fitness",
      date: "January 8, 2026",
      author: "Dr. Lower Parel",
      readTime: "8 min read",
      excerpt: "Common sports injuries among students, proper warm-up techniques, recovery strategies, and when to seek medical attention for sports-related pain.",
      icon: "⚽"
    },
    {
      id: 9,
      title: "Mindful Eating: Beyond Diet Culture",
      category: "Nutrition",
      date: "January 5, 2026",
      author: "Nutritionist Thumper Thompson",
      readTime: "6 min read",
      excerpt: "Moving away from restrictive dieting towards intuitive eating. Learn to listen to your body's hunger cues and develop a positive relationship with food.",
      icon: "🍎"
    },
    {
      id: 10,
      title: "Building Healthy Relationships in College",
      category: "Mental Health",
      date: "January 2, 2026",
      author: "Dr. Andheri",
      readTime: "7 min read",
      excerpt: "Navigate friendships, romantic relationships, and family dynamics during college years. Recognizing healthy vs. unhealthy relationship patterns.",
      icon: "💝"
    },
    {
      id: 11,
      title: "Preventing Common Campus Illnesses",
      category: "Disease Prevention",
      date: "December 28, 2025",
      author: "Dr. Thane",
      readTime: "5 min read",
      excerpt: "Living in close quarters increases illness transmission. Learn about common campus infections, prevention strategies, and maintaining a healthy dorm environment.",
      icon: "🦠"
    },
    {
      id: 12,
      title: "Study Break Stretches: Desk Yoga for Students",
      category: "Fitness",
      date: "December 22, 2025",
      author: "Yoga Instructor Bruce Lee",
      readTime: "4 min read",
      excerpt: "Combat the physical strain of long study sessions with simple stretches and yoga poses you can do at your desk or in the library.",
      icon: "🧘‍♀️"
    }
  ];

  useEffect(() => {
    loadFirebaseArticles();
  }, []);

  const loadFirebaseArticles = async () => {
    try {
      const articlesRef = collection(db, 'healthArticles');
      const querySnapshot = await getDocs(articlesRef);
      
      const firebaseList = [];
      querySnapshot.forEach((doc) => {
        firebaseList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setFirebaseArticles(firebaseList);
      console.log('✅ Loaded Firebase articles:', firebaseList.length);
    } catch (error) {
      console.error('❌ Error loading Firebase articles:', error);
    } finally {
      setLoading(false);
    }
  };

  // COMBINE ALL ARTICLES
  const allArticles = [...maternalArticles, ...generalArticles, ...firebaseArticles];

  const researchUpdates = [
    {
      title: "New Study Links Sleep Patterns to Academic Performance",
      source: "Journal of College Health",
      date: "January 2026",
      summary: "Recent research demonstrates strong correlation between consistent sleep schedules and improved GPA among college students."
    },
    {
      title: "Mental Health Screening Tools Improved with AI",
      source: "American Psychiatric Association",
      date: "December 2025",
      summary: "Artificial intelligence enhancing early detection of depression and anxiety in young adults through digital health platforms."
    },
    {
      title: "Plant-Based Diets Show Promise in Reducing Inflammation",
      source: "Nutrition Research",
      date: "December 2025",
      summary: "Long-term study reveals significant anti-inflammatory benefits of predominantly plant-based eating patterns."
    }
  ];

  const filteredArticles = selectedCategory === 'all' 
    ? allArticles 
    : allArticles.filter(article => article.category === selectedCategory);

    if (loading) {
    return <div className="loading">Loading articles...</div>;
  }

  return (
    <div className="slide-up">
      <div className="page-header">
        <h1>Health Articles & Research</h1>
        <p>Stay informed with expert health information and the latest medical research</p>
      </div>

      {/* Category Filter */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          flexWrap: 'wrap',
          padding: '1.5rem',
          background: 'var(--color-surface)',
          borderRadius: '12px',
          border: '1px solid var(--color-border)'
        }}>
          {categories.map((category, index) => {
            const categoryValue = category === 'All Articles' ? 'all' : category;
            const isActive = selectedCategory === categoryValue;
            
            return (
              <button
                key={index}
                 onClick={() => setSelectedCategory(categoryValue)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? 'var(--color-primary)' : 'var(--color-background)',
                  color: isActive ? 'white' : 'var(--color-text)',
                  fontWeight: isActive ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--color-primary-light)';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--color-background)';
                    e.currentTarget.style.color = 'var(--color-text)';
                  }
                }}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Research Updates */}
      <div className="card" style={{ marginBottom: '3rem' }}>
        <div className="card-header">
          <h2>Latest Research Updates</h2>
          <span className="badge badge-info">New</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {researchUpdates.map((update, index) => (
            <div 
              key={index}
              style={{ 
                padding: '1.5rem', 
                background: 'var(--color-background)', 
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              <h4 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
                {update.title}
              </h4>
              <div style={{ 
                display: 'flex', 
                gap: '1.5rem', 
                marginBottom: '0.75rem',
                fontSize: '0.85rem',
                color: 'var(--color-text-light)'
              }}>
                <span><strong>Source:</strong> {update.source}</span>
                <span><strong>Date:</strong> {update.date}</span>
              </div>
              <p style={{ color: 'var(--color-text-light)', lineHeight: '1.7' }}>
                {update.summary}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div>
        <h2 style={{ 
          marginBottom: '2rem', 
          color: 'var(--color-primary-dark)',
          fontSize: '1.75rem'
        }}>
          {selectedCategory === 'all' ? 'All Articles' : categories.find(c => c.toLowerCase() === selectedCategory)}
          <span style={{ 
            marginLeft: '1rem', 
            fontSize: '1rem', 
            color: 'var(--color-text-light)',
            fontWeight: '400'
          }}>
            ({filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'})
          </span>
        </h2>
        <div className="articles-grid">
          {filteredArticles.map((article) => (
            <div key={article.id} className="article-card">
              <div className="article-image">
                {article.icon}
              </div>
              <div className="article-content">
                <div className="article-meta">
                  <span className="article-category">{article.category}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
                <div className="article-footer">
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                    <div style={{ fontWeight: '600' }}>{article.author}</div>
                    <div>{article.date}</div>
                  </div>
                  <a href="#" className="read-more">
                    Read More →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Signup */}
      <div style={{ 
        marginTop: '4rem',
        padding: '3rem', 
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
        borderRadius: '16px',
        color: 'white',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'white' }}>
          Stay Updated with Health Tips
        </h2>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: '0.95', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Subscribe to our weekly newsletter for the latest health articles, wellness tips, 
          and campus health news delivered to your inbox.
        </p>
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          maxWidth: '500px', 
          margin: '0 auto',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <input 
            type="email" 
            placeholder="Enter your email address"
            style={{
              flex: '1',
              minWidth: '250px',
              padding: '1rem 1.5rem',
              borderRadius: '10px',
              border: 'none',
              fontSize: '1rem',
              fontFamily: 'var(--font-body)'
            }}
          />
          <button 
            className="btn btn-primary"
            style={{
              background: 'var(--color-accent)',
              color: 'var(--color-primary-dark)',
              whiteSpace: 'nowrap'
            }}
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}

export default HealthArticles;