import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import API from '../services/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/categories').then(res => {
      setCategories(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const loadTopics = async (cat) => {
    setSelectedCat(cat);
    try {
      const res = await API.get(`/categories/${cat._id}`);
      setTopics(res.data.data.topics || []);
    } catch { setTopics([]); }
  };

  const catIcons = { 'Quantitative Aptitude': '📐', 'Logical Reasoning': '🧠', 'Verbal Ability': '📖', 'Data Interpretation': '📊' };
  const catColors = { 'Quantitative Aptitude': '#2563EB', 'Logical Reasoning': '#7C3AED', 'Verbal Ability': '#06B6D4', 'Data Interpretation': '#10B981' };

  if (loading) return <div className="loader-container" style={{ paddingTop: '120px' }}><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">{selectedCat ? selectedCat.name : 'Aptitude Categories'}</h1>
          <p className="page-subtitle">{selectedCat ? 'Choose a topic to start practicing' : 'Select a category to explore topics and start practicing'}</p>
          {selectedCat && (
            <button className="btn btn-ghost btn-sm" style={{ marginTop: '12px' }} onClick={() => { setSelectedCat(null); setTopics([]); }}>← Back to Categories</button>
          )}
        </div>

        {!selectedCat ? (
          <div className="grid-2">
            {categories.map(cat => (
              <div className="category-card" key={cat._id} onClick={() => loadTopics(cat)} style={{ cursor: 'pointer' }}>
                <div className="category-icon" style={{ background: `${catColors[cat.name] || '#2563EB'}20` }}>
                  <span style={{ fontSize: '1.8rem' }}>{catIcons[cat.name] || cat.icon}</span>
                </div>
                <h3 className="category-name">{cat.name}</h3>
                <p className="category-desc">{cat.description}</p>
                <div className="category-meta">
                  <span className="category-count">{cat.questionCount || 0} Questions</span>
                  <span className="btn btn-sm btn-ghost">Explore →</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {topics.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📚</div>
                <p className="empty-state-title">No topics yet</p>
                <p className="empty-state-desc">Topics will appear once added by the admin</p>
              </div>
            ) : (
              <div className="topic-grid">
                {topics.map(topic => (
                  <Link to={`/practice?category=${selectedCat._id}&topic=${topic._id}&topicName=${encodeURIComponent(topic.name)}&categoryName=${encodeURIComponent(selectedCat.name)}`} key={topic._id} className="topic-tag">
                    {topic.icon || '📝'} {topic.name}
                    <span className="topic-count">{topic.questionCount || 0}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
