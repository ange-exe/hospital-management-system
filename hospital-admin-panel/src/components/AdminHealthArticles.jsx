import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import CategoryCover from './CategoryCover';

const getCategoryGradient = (category) => {
  const gradients = {
    'Maternal & Infant Care': 'linear-gradient(135deg, #f093fb, #f5576c)',
    'Mental Health':          'linear-gradient(135deg, #4facfe, #00f2fe)',
    'Nutrition':              'linear-gradient(135deg, #43e97b, #38f9d7)',
    'Fitness':                'linear-gradient(135deg, #fa709a, #fee140)',
    'Disease Prevention':     'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    'Sleep Health':           'linear-gradient(135deg, #667eea, #764ba2)',
    'Campus Wellness':        'linear-gradient(135deg, #0ba360, #3cba92)',
  };
  return gradients[category] || 'linear-gradient(135deg, #0A4D3C, #0F6B52)';
};

function AdminHealthArticles() {
  const [articles, setArticles] = useState([]);
  const [firebaseArticles, setFirebaseArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  const [formData, setFormData] = useState({
    title: '',
    category: 'Mental Health',
    author: '',
    readTime: '',
    excerpt: '',
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


  const dummyArticles = [
    { id: 'dummy-101', title: "First Trimester Care: What to Expect", category: "Maternal & Infant Care", date: "February 1, 2026", author: "Dr. Vikhroli", readTime: "8 min read", excerpt: "Essential information for the first 12 weeks of pregnancy...", icon: "", isDummy: true },
    { id: 'dummy-102', title: "Managing Academic Stress: A Student's Guide", category: "Mental Health", date: "January 28, 2026", author: "Dr. Dadar", readTime: "5 min read", excerpt: "Learn evidence-based strategies for managing academic pressure...", icon: "", isDummy: true },
    { id: 'dummy-103', title: "Sleep Hygiene for College Students", category: "Sleep Health", date: "January 25, 2026", author: "Dr. Thane", readTime: "4 min read", excerpt: "Quality sleep is essential for academic performance...", icon: "", isDummy: true },
    { id: 'dummy-104', title: "Nutrition on a Budget: Healthy Eating in College", category: "Nutrition", date: "January 22, 2026", author: "Nutritionist Thumper Thompson", readTime: "6 min read", excerpt: "Eating healthy doesn't have to break the bank...", icon: "", isDummy: true }
  ];

  useEffect(() => { loadArticles(); }, []);

  const loadArticles = async () => {
    try {
      const articlesRef = collection(db, 'healthArticles');
      const querySnapshot = await getDocs(articlesRef);
      const firebaseList = [];
      querySnapshot.forEach((d) => firebaseList.push({ id: d.id, ...d.data(), isDummy: false }));
      setFirebaseArticles(firebaseList);
      setArticles([...dummyArticles, ...firebaseList]);
    } catch (error) {
      console.error(' Error loading articles:', error);
      setArticles(dummyArticles);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
      await addDoc(collection(db, 'healthArticles'), {
        ...formData, fileUrl,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        createdAt: Timestamp.now()
      });
      alert(' Article added successfully!');
      setFormData({ title: '', category: 'Mental Health', author: '', readTime: '', excerpt: '' });
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
    if (isDummy) { alert('Cannot delete dummy articles!'); return; }
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await deleteDoc(doc(db, 'healthArticles', articleId));
      alert(' Article deleted successfully!');
      loadArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const filteredArticles = selectedCategory === 'all'
    ? articles
    : articles.filter(a => a.category === selectedCategory);

  if (loading) return <div className="loading">Loading articles...</div>;

  return (
    <div className="fade-in">
      <div className="admin-header">
        <h1>Health Articles Management</h1>
        <div className="admin-header-actions">
          {/* View toggle */}
          <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('table')}
              style={{ padding: '0.5rem 1rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', background: viewMode === 'table' ? '#3b82f6' : 'white', color: viewMode === 'table' ? 'white' : '#64748b' }}
            >☰ Table</button>
            <button
              onClick={() => setViewMode('grid')}
              style={{ padding: '0.5rem 1rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', background: viewMode === 'grid' ? '#3b82f6' : 'white', color: viewMode === 'grid' ? 'white' : '#64748b' }}
            >⊞ Grid</button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? '✕ Cancel' : '+ Add Article'}
          </button>
        </div>
      </div>

      <div className="admin-content">
        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-card-header">
              <div><div className="stat-card-title">Total Articles</div><div className="stat-card-value">{articles.length}</div></div>
              <div className="stat-card-icon primary"></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header">
              <div><div className="stat-card-title">Dummy Articles</div><div className="stat-card-value">{dummyArticles.length}</div></div>
              <div className="stat-card-icon warning"></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header">
              <div><div className="stat-card-title">Custom Articles</div><div className="stat-card-value">{firebaseArticles.length}</div></div>
              <div className="stat-card-icon success"></div>
            </div>
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
                    <input type="text" name="title" className="form-input" value={formData.title} onChange={handleInputChange} placeholder="e.g., Managing Stress During Exams" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select name="category" className="form-select" value={formData.category} onChange={handleInputChange} required>
                      {categories.filter(c => c !== 'All Articles').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Author *</label>
                    <input type="text" name="author" className="form-input" value={formData.author} onChange={handleInputChange} placeholder="e.g., Dr. Smith" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Read Time</label>
                    <input type="text" name="readTime" className="form-input" value={formData.readTime} onChange={handleInputChange} placeholder="e.g., 5 min read" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Excerpt/Summary *</label>
                    <textarea name="excerpt" className="form-textarea" value={formData.excerpt} onChange={handleInputChange} placeholder="Brief summary of the article..." rows="3" required />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Upload Article File (optional)</label>
                    <input type="file" className="form-input" accept=".pdf,.doc,.docx" onChange={(e) => setArticleFile(e.target.files[0])} style={{ padding: '0.5rem' }} />
                    {articleFile && <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}> {articleFile.name}</div>}
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={uploadingArticle}>
                  {uploadingArticle ? 'Uploading...' : ' Add Article'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <div className="admin-card-body" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {categories.map((category) => {
                const categoryValue = category === 'All Articles' ? 'all' : category;
                const isActive = selectedCategory === categoryValue;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(categoryValue)}
                    style={{
                      padding: '0.4rem 1rem',
                      borderRadius: 20,
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      background: isActive
                        ? (categoryValue === 'all' ? '#3b82f6' : getCategoryGradient(categoryValue))
                        : '#f1f5f9',
                      color: isActive ? 'white' : '#64748b',
                      transition: 'all 0.2s',
                    }}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Articles — GRID VIEW */}
        {viewMode === 'grid' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filteredArticles.map((article) => (
              <div key={article.id} style={{ background: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {/* Cover */}
                <div style={{ position: 'relative' }}>
                  <CategoryCover category={article.category} size="card" style={{ height: 120 }} />
                  {article.isDummy && (
                    <span style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(245,158,11,0.9)', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>DUMMY</span>
                  )}
                  {!article.isDummy && (
                    <span style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(16,185,129,0.9)', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>CUSTOM</span>
                  )}
                  <span style={{ position: 'absolute', bottom: 8, left: 8, color: 'rgba(255,255,255,0.95)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(0,0,0,0.25)', padding: '2px 10px', borderRadius: 20 }}>
                    {article.category}
                  </span>
                </div>
                {/* Content */}
                <div style={{ padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem', lineHeight: 1.3 }}>{article.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem', lineHeight: 1.5 }}>{article.excerpt}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <span> {article.author}</span>
                    <span> {article.readTime}</span>
                  </div>
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{article.date}</span>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(article.id, article.isDummy)}
                      disabled={article.isDummy}
                      style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', opacity: article.isDummy ? 0.5 : 1 }}
                    >
                      {article.isDummy ? '' : ' Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Articles — TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                {selectedCategory === 'all' ? 'All Articles' : selectedCategory} ({filteredArticles.length})
              </h2>
            </div>
            <div className="admin-card-body" style={{ padding: 0 }}>
              {filteredArticles.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"></div>
                  <h3 className="empty-state-title">No articles found</h3>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Cover</th>
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
                        <td>
                          <CategoryCover category={article.category} size="thumb" />
                        </td>
                        <td style={{ fontWeight: 500, maxWidth: 260 }}>{article.title}</td>
                        <td>
                          <span style={{
                            padding: '0.25rem 0.6rem', borderRadius: 6,
                            fontSize: '0.72rem', fontWeight: 700,
                            background: getCategoryGradient(article.category),
                            color: 'white', whiteSpace: 'nowrap',
                          }}>
                            {article.category}
                          </span>
                        </td>
                        <td>{article.author}</td>
                        <td>{article.readTime}</td>
                        <td>{article.date}</td>
                        <td>
                          {article.isDummy
                            ? <span className="badge badge-pending">Dummy</span>
                            : <span className="badge badge-success">Custom</span>}
                        </td>
                        <td>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDelete(article.id, article.isDummy)}
                            disabled={article.isDummy}
                            style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem', opacity: article.isDummy ? 0.5 : 1 }}
                          >
                            {article.isDummy ? ' Locked' : ' Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminHealthArticles;