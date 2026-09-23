import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function MockTestsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    API.get('/tests').then(res => {
      setTests(res.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const startTest = async (testId) => {
    if (!user) return navigate('/login');
    try {
      const res = await API.post(`/tests/${testId}/start`);
      navigate(`/test/${testId}`, { state: { attempt: res.data.data } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start test');
    }
  };

  const filtered = filter === 'all' ? tests : tests.filter(t => t.difficulty === filter);
  const diffColors = { beginner: 'badge-easy', intermediate: 'badge-medium', advanced: 'badge-hard', mixed: 'badge-primary' };

  if (loading) return <div className="loader-container" style={{ paddingTop: '120px' }}><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Mock Tests</h1>
          <p className="page-subtitle">Choose from a variety of mock tests and test your aptitude skills</p>
        </div>

        <div className="tabs" style={{ maxWidth: '500px', marginBottom: '32px' }}>
          {['all', 'beginner', 'intermediate', 'advanced', 'mixed'].map(f => (
            <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p className="empty-state-title">No tests available</p>
            <p className="empty-state-desc">Check back later for new mock tests</p>
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map(test => (
              <div className="card" key={test._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{test.name}</h3>
                  <span className={`badge ${diffColors[test.difficulty] || 'badge-primary'}`}>{test.difficulty}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.6' }}>{test.description || 'Test your aptitude skills with this comprehensive mock test.'}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{test.numberOfQuestions}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Questions</div>
                  </div>
                  <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{test.duration} min</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Duration</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  <span>Total Marks: {test.totalMarks || test.numberOfQuestions}</span>
                  <span>{test.attemptCount || 0} attempts</span>
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => startTest(test._id)}>
                  Start Test →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
