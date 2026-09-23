import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function TestPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(location.state?.attempt || null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reviewed, setReviewed] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(!location.state?.attempt);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    if (!attempt) {
      API.post(`/tests/${id}/start`).then(res => {
        setAttempt(res.data.data);
        setLoading(false);
      }).catch(err => {
        toast.error('Failed to start test');
        navigate('/mock-tests');
      });
    }
  }, []);

  useEffect(() => {
    if (attempt?.test) {
      API.get(`/tests/${typeof attempt.test === 'string' ? attempt.test : attempt.test._id || id}`).then(res => {
        setTimeLeft(res.data.data.duration * 60);
      }).catch(() => setTimeLeft(30 * 60));
    } else {
      setTimeLeft(30 * 60);
    }
  }, [attempt]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 || submitting) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitting]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const questions = attempt?.answers?.map(a => a.question) || [];
  const question = questions[currentQ];

  const selectAnswer = (qId, ans) => {
    setAnswers(prev => ({ ...prev, [qId]: ans }));
  };

  const toggleReview = (qId) => {
    setReviewed(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const getStatus = (idx) => {
    const q = questions[idx];
    const qId = q?._id;
    if (idx === currentQ) return 'current';
    if (reviewed[qId]) return 'review';
    if (answers[qId]) return 'answered';
    return '';
  };

  const handleSubmit = async (auto = false) => {
    if (submitting) return;
    setSubmitting(true);
    setShowSubmitModal(false);
    try {
      const testId = typeof attempt.test === 'string' ? attempt.test : attempt.test?._id || id;
      const res = await API.post(`/tests/${testId}/submit`, {
        attemptId: attempt._id,
        answers,
        timeTaken: attempt ? (timeLeft > 0 ? (30 * 60 - timeLeft) : 30 * 60) : 0
      });
      toast.success(auto ? 'Time up! Test submitted automatically.' : 'Test submitted successfully!');
      navigate(`/results/${res.data.data._id}`);
    } catch (err) {
      toast.error('Failed to submit test');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loader-container"><div className="spinner" /></div>;
  if (!question) return <div className="loader-container"><p>No questions found</p></div>;

  const answeredCount = Object.keys(answers).length;
  const totalQ = questions.length;
  const timerClass = timeLeft < 60 ? 'danger' : timeLeft < 300 ? 'warning' : '';

  return (
    <div className="test-interface">
      {/* Test Header */}
      <div className="test-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src="/logo.png" alt="AptitudeHub" style={{ height: '32px' }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Question {currentQ + 1} / {totalQ}
          </span>
        </div>
        <div className={`test-timer ${timerClass}`}>
          🕐 {formatTime(timeLeft)}
        </div>
        <button className="btn btn-danger btn-sm" onClick={() => setShowSubmitModal(true)}>
          Submit Test
        </button>
      </div>

      <div className="test-body">
        {/* Question Panel */}
        <div className="question-panel">
          <div className="question-number">
            <span className={`badge ${question.difficulty === 'easy' ? 'badge-easy' : question.difficulty === 'medium' ? 'badge-medium' : 'badge-hard'}`}>
              {question.difficulty}
            </span>
            <span>Marks: {question.marks || 1}</span>
            {question.negativeMark > 0 && <span style={{ color: 'var(--error)' }}>-{question.negativeMark}</span>}
          </div>

          <div className="question-text">{question.question}</div>

          <div className="options-list">
            {question.options?.map((opt, i) => (
              <div
                key={i}
                className={`option-item ${answers[question._id] === opt.label ? 'selected' : ''}`}
                onClick={() => selectAnswer(question._id, opt.label)}
              >
                <div className="option-label">{opt.label}</div>
                <div className="option-text">{opt.text}</div>
              </div>
            ))}
          </div>

          <div className="question-nav-buttons">
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-ghost" disabled={currentQ === 0} onClick={() => setCurrentQ(currentQ - 1)}>← Previous</button>
              <button className="btn btn-ghost" onClick={() => toggleReview(question._id)}>
                {reviewed[question._id] ? '★ Marked' : '☆ Mark for Review'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {answers[question._id] && (
                <button className="btn btn-ghost btn-sm" onClick={() => {
                  const newAns = { ...answers };
                  delete newAns[question._id];
                  setAnswers(newAns);
                }}>Clear</button>
              )}
              {currentQ < totalQ - 1 ? (
                <button className="btn btn-primary" onClick={() => setCurrentQ(currentQ + 1)}>Next →</button>
              ) : (
                <button className="btn btn-success" onClick={() => setShowSubmitModal(true)}>Finish Test</button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Panel */}
        <div className="nav-panel">
          <div className="nav-panel-title">Question Navigator</div>
          <div className="nav-legend">
            <div className="nav-legend-item"><div className="nav-legend-dot" style={{ background: 'var(--primary-blue)' }} /> Current</div>
            <div className="nav-legend-item"><div className="nav-legend-dot" style={{ background: 'var(--success)' }} /> Answered</div>
            <div className="nav-legend-item"><div className="nav-legend-dot" style={{ background: 'var(--warning)' }} /> Review</div>
          </div>
          <div className="nav-grid">
            {questions.map((_, i) => (
              <button
                key={i}
                className={`nav-btn ${getStatus(i)}`}
                onClick={() => setCurrentQ(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Progress</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{answeredCount}/{totalQ} Answered</div>
            <div className="progress-bar" style={{ marginTop: '8px' }}>
              <div className="progress-fill" style={{ width: `${(answeredCount / totalQ) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Submit Test?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              You have answered <strong>{answeredCount}</strong> out of <strong>{totalQ}</strong> questions.
              {totalQ - answeredCount > 0 && <span style={{ color: 'var(--warning)' }}> {totalQ - answeredCount} questions are unanswered.</span>}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowSubmitModal(false)}>Continue Test</button>
              <button className="btn btn-primary" onClick={() => handleSubmit(false)} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
