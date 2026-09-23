import { useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function DailyChallengePage() {
  const [challenge, setChallenge] = useState(null);
  const [attempted, setAttempted] = useState(false);
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    API.get('/daily-challenge').then(res => {
      setChallenge(res.data.data);
      setAttempted(res.data.attempted);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(p => p <= 1 ? (clearInterval(t), handleSubmit(), 0) : p - 1), 1000);
    return () => clearInterval(t);
  }, [started, timeLeft]);

  const startChallenge = () => {
    setStarted(true);
    setTimeLeft((challenge?.duration || 10) * 60);
  };

  const handleSubmit = async () => {
    try {
      const res = await API.post('/daily-challenge/submit', {
        challengeId: challenge._id,
        answers
      });
      setResult(res.data.data);
      setStarted(false);
      toast.success(`Challenge complete! +${res.data.xpEarned} XP`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (loading) return <div className="loader-container" style={{ paddingTop: '120px' }}><div className="spinner" /></div>;

  if (result) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <h1 className="page-title" style={{ marginBottom: '16px' }}>Daily Challenge Complete! 🎉</h1>
          <div className="result-hero">
            <div className="result-score-circle" style={result.accuracy >= 60 ? { borderColor: 'var(--success)' } : { borderColor: 'var(--warning)' }}>
              <div className="result-percentage" style={{ color: result.accuracy >= 60 ? 'var(--success)' : 'var(--warning)' }}>{result.score}/{result.totalQuestions}</div>
              <div className="result-label">Correct</div>
            </div>
            <div className="result-stats-grid">
              <div className="result-stat"><div className="result-stat-value">{result.accuracy}%</div><div className="result-stat-label">Accuracy</div></div>
              <div className="result-stat"><div className="result-stat-value" style={{ color: 'var(--primary-teal)' }}>+{result.xpEarned}</div><div className="result-stat-label">XP Earned</div></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!challenge) return <div className="page"><div className="container"><div className="empty-state"><div className="empty-state-icon">📅</div><p className="empty-state-title">No challenge available today</p></div></div></div>;

  if (attempted) return (
    <div className="page">
      <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <h1 className="page-title">Daily Challenge</h1>
        <div className="card" style={{ marginTop: '32px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✅</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Already Completed!</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Come back tomorrow for a new challenge.</p>
        </div>
      </div>
    </div>
  );

  if (!started) return (
    <div className="page">
      <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <h1 className="page-title" style={{ marginBottom: '32px' }}>⚡ Daily Challenge</h1>
        <div className="card">
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎯</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Today's Challenge</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{challenge.topicName || 'Mixed Topics'}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '28px' }}>
            <div><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{challenge.numberOfQuestions}</div><div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Questions</div></div>
            <div><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{challenge.duration} min</div><div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Duration</div></div>
            <div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-teal)' }}>+{challenge.xpReward}</div><div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>XP Reward</div></div>
          </div>
          <button className="btn btn-primary btn-lg" onClick={startChallenge}>Start Challenge →</button>
        </div>
      </div>
    </div>
  );

  const q = challenge.questions[currentQ];
  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '700px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <span>Question {currentQ + 1} / {challenge.questions.length}</span>
          <div className={`test-timer ${timeLeft < 60 ? 'danger' : timeLeft < 180 ? 'warning' : ''}`}>🕐 {formatTime(timeLeft)}</div>
        </div>
        <div className="question-panel">
          <div className="question-text">{q.question}</div>
          <div className="options-list">
            {q.options?.map((opt, i) => (
              <div key={i} className={`option-item ${answers[q._id] === opt.label ? 'selected' : ''}`} onClick={() => setAnswers({ ...answers, [q._id]: opt.label })}>
                <div className="option-label">{opt.label}</div>
                <div className="option-text">{opt.text}</div>
              </div>
            ))}
          </div>
          <div className="question-nav-buttons">
            <button className="btn btn-ghost" disabled={currentQ === 0} onClick={() => setCurrentQ(currentQ - 1)}>← Prev</button>
            {currentQ < challenge.questions.length - 1 ? (
              <button className="btn btn-primary" onClick={() => setCurrentQ(currentQ + 1)}>Next →</button>
            ) : (
              <button className="btn btn-success" onClick={handleSubmit}>Submit Challenge</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
