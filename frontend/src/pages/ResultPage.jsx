import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';

export default function ResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSolutions, setShowSolutions] = useState(false);

  useEffect(() => {
    API.get(`/results/${id}`).then(res => {
      setResult(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loader-container" style={{ paddingTop: '120px' }}><div className="spinner" /></div>;
  if (!result) return <div className="loader-container"><p>Result not found</p></div>;

  const scoreClass = result.percentage >= 80 ? 'excellent' : result.percentage >= 60 ? 'good' : result.percentage >= 40 ? 'average' : 'poor';
  const scoreColor = result.percentage >= 80 ? 'var(--success)' : result.percentage >= 60 ? 'var(--primary-teal)' : result.percentage >= 40 ? 'var(--warning)' : 'var(--error)';

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Result Hero */}
        <div className="result-hero">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Test Complete!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>{result.test?.name || 'Mock Test'}</p>

          <div className={`result-score-circle ${scoreClass}`}>
            <div className="result-percentage" style={{ color: scoreColor }}>{result.percentage}%</div>
            <div className="result-label">Score</div>
          </div>

          <div className="result-stats-grid">
            <div className="result-stat">
              <div className="result-stat-value" style={{ color: 'var(--text-heading)' }}>{result.score}/{result.totalMarks}</div>
              <div className="result-stat-label">Total Score</div>
            </div>
            <div className="result-stat">
              <div className="result-stat-value" style={{ color: 'var(--success)' }}>{result.correctAnswers}</div>
              <div className="result-stat-label">Correct</div>
            </div>
            <div className="result-stat">
              <div className="result-stat-value" style={{ color: 'var(--error)' }}>{result.wrongAnswers}</div>
              <div className="result-stat-label">Wrong</div>
            </div>
            <div className="result-stat">
              <div className="result-stat-value" style={{ color: 'var(--warning)' }}>{result.skippedQuestions}</div>
              <div className="result-stat-label">Skipped</div>
            </div>
            <div className="result-stat">
              <div className="result-stat-value" style={{ color: 'var(--primary-teal)' }}>{result.accuracy}%</div>
              <div className="result-stat-label">Accuracy</div>
            </div>
            <div className="result-stat">
              <div className="result-stat-value" style={{ color: 'var(--text-secondary)' }}>{result.totalQuestions}</div>
              <div className="result-stat-label">Total Questions</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setShowSolutions(!showSolutions)}>
            {showSolutions ? 'Hide Solutions' : '📋 View Solutions'}
          </button>
          <Link to="/mock-tests" className="btn btn-secondary">🔄 Retake Test</Link>
          <Link to="/dashboard" className="btn btn-ghost">← Back to Dashboard</Link>
        </div>

        {/* Solutions */}
        {showSolutions && (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Solutions</h3>
            {result.answers?.map((ans, i) => {
              const q = ans.question;
              if (!q) return null;
              return (
                <div key={i} className="card" style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Question {i + 1}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span className={`badge ${q.difficulty === 'easy' ? 'badge-easy' : q.difficulty === 'medium' ? 'badge-medium' : 'badge-hard'}`}>{q.difficulty}</span>
                      {ans.isSkipped ? (
                        <span className="badge badge-medium">Skipped</span>
                      ) : ans.isCorrect ? (
                        <span className="badge badge-easy">Correct</span>
                      ) : (
                        <span className="badge badge-hard">Wrong</span>
                      )}
                    </div>
                  </div>
                  <div className="question-text" style={{ fontSize: '1rem', marginBottom: '16px' }}>{q.question}</div>
                  <div className="options-list">
                    {q.options?.map((opt, j) => {
                      let cls = 'option-item';
                      if (opt.label === q.correctAnswer) cls += ' correct';
                      else if (opt.label === ans.selectedAnswer && !ans.isCorrect) cls += ' wrong';
                      return (
                        <div key={j} className={cls} style={{ cursor: 'default' }}>
                          <div className="option-label">{opt.label}</div>
                          <div className="option-text">{opt.text}</div>
                          {opt.label === q.correctAnswer && <span style={{ marginLeft: 'auto', color: 'var(--success)' }}>✓ Correct</span>}
                          {opt.label === ans.selectedAnswer && opt.label !== q.correctAnswer && <span style={{ marginLeft: 'auto', color: 'var(--error)' }}>✗ Your Answer</span>}
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <div className="explanation-box">
                      <div className="explanation-title">💡 Explanation</div>
                      <div className="explanation-text">{q.explanation}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
