import { useState, useEffect } from 'react';
import API from '../services/api';

export default function MistakeNotebookPage() {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/results/mistakes').then(res => { setMistakes(res.data.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader-container" style={{ paddingTop: '120px' }}><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="page-header">
          <h1 className="page-title">📓 Mistake Notebook</h1>
          <p className="page-subtitle">{mistakes.length} questions you've gotten wrong</p>
        </div>
        {mistakes.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">✨</div><p className="empty-state-title">No mistakes yet!</p><p className="empty-state-desc">Questions you answer incorrectly will appear here</p></div>
        ) : mistakes.map((m, i) => {
          const q = m.question;
          return (
            <div className="card" key={i} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className={`badge ${q.difficulty === 'easy' ? 'badge-easy' : q.difficulty === 'medium' ? 'badge-medium' : 'badge-hard'}`}>{q.difficulty}</span>
                  {q.topic?.name && <span className="badge badge-teal">{q.topic.name}</span>}
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Wrong {m.wrongAttempts}x / {m.attempts} attempts
                </span>
              </div>
              <p style={{ fontSize: '1rem', color: 'var(--text-heading)', lineHeight: '1.6', marginBottom: '12px' }}>{q.question}</p>
              {q.options?.map((opt, j) => (
                <div key={j} style={{ padding: '6px 12px', margin: '2px 0', fontSize: '0.9rem', color: opt.label === q.correctAnswer ? 'var(--success)' : 'var(--text-secondary)', background: opt.label === q.correctAnswer ? 'var(--success-bg)' : 'transparent', borderRadius: 'var(--radius-sm)' }}>
                  <strong>{opt.label}.</strong> {opt.text}
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
