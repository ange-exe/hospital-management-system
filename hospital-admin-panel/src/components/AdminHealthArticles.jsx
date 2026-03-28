import React, { useState, useEffect } from 'react';
import { db,storage } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function AdminHealthArticles() {
  const [articles, setArticles] = useState([]);
  const [firebaseArticles, setFirebaseArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Mental Health',
    author: '',
    readTime: '',
    excerpt: '',
    icon: '📄'
  });
  const [articleFile, setArticleFile] = useState(null);
  const [uploadingArticle, setUploadingArticle] = useState(false);

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

  const iconOptions = ['📄', '🧠', '💊', '🏥', '🤰', '👶', '💝', '🍼', '🥗', '😴', '🏃‍♀️', '💉', '📱', '⚽', '🍎', '🦠', '🧘‍♀️'];

  // DUMMY ARTICLES (same as user panel)
  const dummyArticles = [
    {
      id: 'dummy-101',
      title: "First Trimester Care: What to Expect",
      category: "Maternal & Infant Care",
      date: "February 1, 2026",
      author: "Dr. Vikhroli",
      readTime: "8 min read",
      excerpt: "Essential information for the first 12 weeks of pregnancy...",
      icon: "🤰",
      isDummy: true
    },
    {
      id: 'dummy-102',
      title: "Managing Academic Stress: A Student's Guide",
      category: "Mental Health",
      date: "January 28, 2026",
      author: "Dr. Dadar",
      readTime: "5 min read",
      excerpt: "Learn evidence-based strategies for managing academic pressure...",
      icon: "🧠",
      isDummy: true
    },
    {
      id: 'dummy-103',
      title: "Sleep Hygiene for College Students",
      category: "Sleep Health",
      date: "January 25, 2026",
      author: "Dr. Thane",
      readTime: "4 min read",
      excerpt: "Quality sleep is essential for academic performance...",
      icon: "😴",
      isDummy: true
    },
    {
      id: 'dummy-104',
      title: "Nutrition on a Budget: Healthy Eating in College",
      category: "Nutrition",
      date: "January 22, 2026",
      author: "Nutritionist Thumper Thompson",
      readTime: "6 min read",
      excerpt: "Eating healthy doesn't have to break the bank...",
      icon: "🥗",
      isDummy: true
    }
  ];

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const articlesRef = collection(db, 'healthArticles');
      const querySnapshot = await getDocs(articlesRef);
      
      const firebaseList = [];
      querySnapshot.forEach((doc) => {
        firebaseList.push({
          id: doc.id,
          ...doc.data(),
          isDummy: false
        });
      });
      
      setFirebaseArticles(firebaseList);
      setArticles([...dummyArticles, ...firebaseList]);
      
      console.log('✅ Loaded articles:', { dummy: dummyArticles.length, firebase: firebaseList.length });
    } catch (error) {
      console.error('❌ Error loading articles:', error);
      setArticles(dummyArticles);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.excerpt) {
      alert('Please fill all required fields');
      return;
    }
    try {
      setUploadingArticle(true);
      let fileUrl = '';

      if (articleFile) {
        const fileRef = ref(storage, `healthArticles/${Date.now()}_${articleFile.name}`);
        await uploadBytes(fileRef, articleFile);
        fileUrl = await getDownloadURL(fileRef);
      }

      const articlesRef = collection(db, 'healthArticles');
      await addDoc(articlesRef, {
        ...formData,
        fileUrl,
        date: new Date().toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric'
        }),
        createdAt: Timestamp.now()
      });

      alert('✅ Article added successfully!');
      setFormData({
        title: '',
        category: 'Mental Health',
        author: '',
        readTime: '',
        excerpt: '',
        icon: '📄'
      });
      setArticleFile(null);
      setShowAddForm(false);
      loadArticles();
    } catch (error) {
      console.error('Error adding article:', error);
      alert('Error adding article. Please try again.');
    } finally {
      setUploadingArticle(false);
    }
  };

  const handleDelete = async (articleId, isDummy) => {
    if (isDummy) {
      alert('Cannot delete dummy articles!');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'healthArticles', articleId));
      alert('✅ Article deleted successfully!');
      loadArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Error deleting article. Please try again.');
    }
  };

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  if (loading) {
    return <div className="loading">Loading articles...</div>;
  }

  return (
    <div className="fade-in">
      <div className="admin-header">
        <h1>Health Articles Management</h1>
        <div className="admin-header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? '✕ Cancel' : '+ Add Article'}
          </button>
        </div>
      </div>

      <div className="admin-content">
        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-card-title">Total Articles</div>
            <div className="stat-card-value">{articles.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-title">Dummy Articles</div>
            <div className="stat-card-value">{dummyArticles.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-title">Custom Articles</div>
            <div className="stat-card-value">{firebaseArticles.length}</div>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="admin-card" style={{ marginBottom: '2rem' }}>
            <div className="admin-card-header">
              <h2 className="admin-card-title">Add New Article</h2>
            </div>
            <div className="admin-card-body">
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      name="title"
                      className="form-input"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Managing Stress During Exams"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      name="category"
                      className="form-select"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      {categories.filter(c => c !== 'All Articles').map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Icon</label>
                    <select
                      name="icon"
                      className="form-select"
                      value={formData.icon}
                      onChange={handleInputChange}
                    >
                      {iconOptions.map((icon) => (
                        <option key={icon} value={icon}>{icon} {icon}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Author *</label>
                    <input
                      type="text"
                      name="author"
                      className="form-input"
                      value={formData.author}
                      onChange={handleInputChange}
                      placeholder="e.g., Dr. Smith"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Read Time *</label>
                    <input
                      type="text"
                      name="readTime"
                      className="form-input"
                      value={formData.readTime}
                      onChange={handleInputChange}
                      placeholder="e.g., 5 min read"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Excerpt/Summary *</label>
                    <textarea
                      name="excerpt"
                      className="form-textarea"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      placeholder="Brief summary of the article..."
                      rows="4"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Upload Article File (optional)</label>
                    <input
                      type="file"
                      className="form-input"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setArticleFile(e.target.files[0])}
                      style={{ padding: '0.5rem' }}
                    />
                    {articleFile && (
                      <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>
                        ✅ Selected: {articleFile.name}
                      </div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Upload PDF or Word document of the full article
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={uploadingArticle}>
                  {uploadingArticle ? '⏳ Uploading...' : '📄 Add Article'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <div className="admin-card-body">
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {categories.map((category) => {
                const categoryValue = category === 'All Articles' ? 'all' : category;
                const isActive = selectedCategory === categoryValue;
                
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(categoryValue)}
                    className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.875rem' }}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Articles Table */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              {selectedCategory === 'all' ? 'All Articles' : selectedCategory} ({filteredArticles.length})
            </h2>
          </div>
          <div className="admin-card-body" style={{ padding: 0 }}>
            {filteredArticles.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📄</div>
                <h3 className="empty-state-title">No articles found</h3>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Author</th>
                    <th>Read Time</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map((article) => (
                    <tr key={article.id}>
                      <td style={{ fontSize: '1.5rem' }}>{article.icon}</td>
                      <td style={{ fontWeight: 500, maxWidth: '300px' }}>{article.title}</td>
                      <td>
                        <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                          {article.category}
                        </span>
                      </td>
                      <td>{article.author}</td>
                      <td>{article.readTime}</td>
                      <td>{article.date}</td>
                      <td>
                        {article.isDummy ? (
                          <span className="badge badge-pending">Dummy</span>
                        ) : (
                          <span className="badge badge-success">Custom</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(article.id, article.isDummy)}
                          style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
                          disabled={article.isDummy}
                        >
                          {article.isDummy ? '🔒 Locked' : '🗑️ Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminHealthArticles;