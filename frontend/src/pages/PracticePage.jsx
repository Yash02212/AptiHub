import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function PracticePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [config, setConfig] = useState({
    category: searchParams.get('category') || '',
    topic: searchParams.get('topic') || '',
    difficulty: '',
    count: 10
  });
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [stats, setStats] = useState({ correct: 0, wrong: 0, total: 0 });
  const [started, setStarted] = useState(false);

  useEffect(() => {
    API.get('/categories').then(res => setCategories(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (config.category) {
      API.get(`/topics?category=${config.category}`).then(res => setTopics(res.data.data)).catch(() => {});
    }
  }, [config.category]);

  const startPractice = async () => {
    if (!user) return navigate('/login');
    try {
      const params = new URLSearchParams();
      if (config.category) params.append('category', config.category);
      if (config.topic) params.append('topic', config.topic);
      if (config.difficulty) params.append('difficulty', config.difficulty);
      params.append('count', config.count);
      const res = await API.get(`/questions/random?${params}`);
      if (res.data.data.length === 0) return toast.error('No questions found for this configuration');
      setQuestions(res.data.data);
      setStarted(true);
      setCurrentQ(0);
      setStats({ correct: 0, wrong: 0, total: 0 });
    } catch (err) {
      toast.error('Failed to load questions');
    }
  };

  const checkAnswer = (label) => {
    if (showAnswer) return;
    setSelectedAnswer(label);
    setShowAnswer(true);
    const isCorrect = label === questions[currentQ].correctAnswer;
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
      total: prev.total + 1
    }));
  };

  const nextQuestion = () => {
    setShowAnswer(false);
    setSelectedAnswer(null);
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQ > 0) {
      setShowAnswer(false);
      setSelectedAnswer(null);
      setCurrentQ(currentQ - 1);
    }
  };

  const topicName = searchParams.get('topicName') || '';
  const categoryName = searchParams.get('categoryName') || '';

  if (!started) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="page-header">
            <h1 className="page-title">Practice Mode</h1>
            <p className="page-subtitle">{topicName ? `Practice ${topicName}` : 'Configure your practice session'}</p>
          </div>
          <div className="card">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={config.category} onChange={e => setConfig({ ...config, category: e.target.value, topic: '' })}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            {config.category && (
              <div className="form-group">
                <label className="form-label">Topic</label>
                <select className="form-select" value={config.topic} onChange={e => setConfig({ ...config, topic: e.target.value })}>
                  <option value="">All Topics</option>
                  {topics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select className="form-select" value={config.difficulty} onChange={e => setConfig({ ...config, difficulty: e.target.value })}>
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Number of Questions</label>
              <select className="form-select" value={config.count} onChange={e => setConfig({ ...config, count: e.target.value })}>
                <option value="5">5 Questions</option>
                <option value="10">10 Questions</option>
                <option value="15">15 Questions</option>
                <option value="20">20 Questions</option>
                <option value="30">30 Questions</option>
              </select>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={startPractice}>
              Start Practice →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Progress Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Question {currentQ + 1} of {questions.length}</span>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--success)' }}>✓ {stats.correct}</span>
            <span style={{ color: 'var(--error)' }}>✗ {stats.wrong}</span>
            <span style={{ color: 'var(--text-muted)' }}>Accuracy: {accuracy}%</span>
          </div>
        </div>
        <div className="progress-bar" style={{ marginBottom: '24px' }}>
          <div className="progress-fill" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
        </div>

        <div className="question-panel">
          <div className="question-number">
            <span className={`badge ${q.difficulty === 'easy' ? 'badge-easy' : q.difficulty === 'medium' ? 'badge-medium' : 'badge-hard'}`}>{q.difficulty}</span>
            {q.topic?.name && <span style={{ color: 'var(--text-muted)' }}>{q.topic.name}</span>}
          </div>

          <div className="question-text">{q.question}</div>

          <div className="options-list">
            {q.options?.map((opt, i) => {
              let className = 'option-item';
              if (showAnswer) {
                if (opt.label === q.correctAnswer) className += ' correct';
                else if (opt.label === selectedAnswer && opt.label !== q.correctAnswer) className += ' wrong';
              } else if (selectedAnswer === opt.label) {
                className += ' selected';
              }
              return (
                <div key={i} className={className} onClick={() => checkAnswer(opt.label)} style={{ cursor: showAnswer ? 'default' : 'pointer' }}>
                  <div className="option-label">{opt.label}</div>
                  <div className="option-text">{opt.text}</div>
                  {showAnswer && opt.label === q.correctAnswer && <span style={{ marginLeft: 'auto', color: 'var(--success)', fontSize: '1.2rem' }}>✓</span>}
                  {showAnswer && opt.label === selectedAnswer && opt.label !== q.correctAnswer && <span style={{ marginLeft: 'auto', color: 'var(--error)', fontSize: '1.2rem' }}>✗</span>}
                </div>
              );
            })}
          </div>

          {showAnswer && q.explanation && (
            <div className="explanation-box">
              <div className="explanation-title">💡 Explanation</div>
              <div className="explanation-text">{q.explanation}</div>
            </div>
          )}

          <div className="question-nav-buttons">
            <button className="btn btn-ghost" disabled={currentQ === 0} onClick={prevQuestion}>← Previous</button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-ghost" onClick={() => { setStarted(false); setQuestions([]); }}>Exit Practice</button>
              {currentQ < questions.length - 1 ? (
                <button className="btn btn-primary" onClick={nextQuestion}>Next →</button>
              ) : (
                <button className="btn btn-success" onClick={() => { setStarted(false); setQuestions([]); toast.success(`Practice complete! ${stats.correct}/${stats.total} correct (${accuracy}%)`); }}>
                  Finish Practice
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
