import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadBookmarks(); }, []);

  const loadBookmarks = () => {
    API.get('/bookmarks').then(res => { setBookmarks(res.data.data || []); setLoading(false); }).catch(() => setLoading(false));
  };

  const removeBookmark = async (qId) => {
    try {
      await API.delete(`/bookmarks/${qId}`);
      setBookmarks(prev => prev.filter(b => b.question?._id !== qId));
      toast.success('Bookmark removed');
    } catch { toast.error('Failed to remove'); }
  };

  if (loading) return <div className="loader-container" style={{ paddingTop: '120px' }}><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="page-header">
          <h1 className="page-title">🔖 My Bookmarks</h1>
          <p className="page-subtitle">{bookmarks.length} bookmarked questions</p>
        </div>
        {bookmarks.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🔖</div><p className="empty-state-title">No bookmarks yet</p><p className="empty-state-desc">Bookmark questions during practice to review later</p></div>
        ) : bookmarks.map((b, i) => {
          const q = b.question;
          if (!q) return null;
          return (
            <div className="card" key={i} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className={`badge ${q.difficulty === 'easy' ? 'badge-easy' : q.difficulty === 'medium' ? 'badge-medium' : 'badge-hard'}`}>{q.difficulty}</span>
                  {q.topic?.name && <span className="badge badge-teal">{q.topic.name}</span>}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => removeBookmark(q._id)}>✕ Remove</button>
              </div>
              <p style={{ fontSize: '1rem', color: 'var(--text-heading)', lineHeight: '1.6' }}>{q.question}</p>
              {q.options?.map((opt, j) => (
                <div key={j} style={{ padding: '8px 12px', margin: '4px 0', fontSize: '0.9rem', color: opt.label === q.correctAnswer ? 'var(--success)' : 'var(--text-secondary)', background: opt.label === q.correctAnswer ? 'var(--success-bg)' : 'transparent', borderRadius: 'var(--radius-sm)' }}>
                  <strong>{opt.label}.</strong> {opt.text} {opt.label === q.correctAnswer && ' ✓'}
                </div>
              ))}
              {q.explanation && <div className="explanation-box" style={{ marginTop: '12px' }}><div className="explanation-title">💡 Explanation</div><div className="explanation-text">{q.explanation}</div></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
