import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { HiAcademicCap, HiLightningBolt, HiChartBar, HiClock, HiStar, HiUsers, HiQuestionMarkCircle, HiCheckCircle, HiBookOpen, HiTrendingUp, HiPuzzle, HiClipboardList } from 'react-icons/hi';

export default function HomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalQuestions: 0, totalTests: 0, totalStudents: 0, totalCategories: 0 });
  const [faqOpen, setFaqOpen] = useState(null);

  useEffect(() => {
    API.get('/stats').then(res => setStats(res.data.data)).catch(() => {});
  }, []);

  const categories = [
    { name: 'Quantitative Aptitude', icon: '📐', desc: 'Master numbers, algebra, percentages, and more', color: '#2563EB' },
    { name: 'Logical Reasoning', icon: '🧠', desc: 'Sharpen your analytical and logical thinking', color: '#7C3AED' },
    { name: 'Verbal Ability', icon: '📖', desc: 'Improve grammar, vocabulary, and comprehension', color: '#06B6D4' },
    { name: 'Data Interpretation', icon: '📊', desc: 'Analyze charts, graphs, and data sets', color: '#10B981' }
  ];

  const features = [
    { icon: <HiClipboardList />, title: 'Practice Tests', desc: 'Topic-wise practice with instant feedback' },
    { icon: <HiClock />, title: 'Timed Mock Tests', desc: 'Simulate real exam conditions' },
    { icon: <HiCheckCircle />, title: 'Instant Results', desc: 'Get detailed results immediately' },
    { icon: <HiChartBar />, title: 'Detailed Analytics', desc: 'Track your performance over time' },
    { icon: <HiLightningBolt />, title: 'Daily Challenges', desc: 'New challenges every day' },
    { icon: <HiUsers />, title: 'Leaderboards', desc: 'Compete with others globally' },
    { icon: <HiTrendingUp />, title: 'Personalized Practice', desc: 'AI-powered recommendations' },
    { icon: <HiBookOpen />, title: 'Explanations', desc: 'Detailed solution explanations' }
  ];

  const steps = [
    { num: 1, title: 'Create Account', desc: 'Sign up in seconds' },
    { num: 2, title: 'Choose Topic', desc: 'Pick your category' },
    { num: 3, title: 'Practice & Test', desc: 'Solve questions' },
    { num: 4, title: 'Get Results', desc: 'Instant evaluation' },
    { num: 5, title: 'Analyze', desc: 'Review performance' },
    { num: 6, title: 'Improve', desc: 'Focus on weak areas' }
  ];

  const testimonials = [
    { name: 'Ananya S.', role: 'Engineering Student', text: 'AptitudeHub helped me prepare for my campus placements. The mock tests were incredibly realistic and the analytics helped me identify my weak areas.', avatar: 'A' },
    { name: 'Rahul K.', role: 'MBA Aspirant', text: 'The daily challenges keep me motivated. I love how the platform tracks my progress and suggests topics I need to work on.', avatar: 'R' },
    { name: 'Priya M.', role: 'Competitive Exam Prep', text: 'The question quality is excellent and explanations are very detailed. It has become my go-to platform for aptitude practice.', avatar: 'P' }
  ];

  const faqs = [
    { q: 'Is AptitudeHub free to use?', a: 'Yes! AptitudeHub provides free access to practice questions, mock tests, and analytics. We believe quality education should be accessible to everyone.' },
    { q: 'What types of aptitude tests are available?', a: 'We cover Quantitative Aptitude, Logical Reasoning, Verbal Ability, and Data Interpretation with questions ranging from easy to hard difficulty.' },
    { q: 'Can I track my progress over time?', a: 'Absolutely! Our detailed analytics dashboard shows your score history, topic-wise performance, accuracy trends, and personalized recommendations.' },
    { q: 'Are the mock tests timed?', a: 'Yes, mock tests simulate real exam conditions with countdown timers, question navigation panels, and automatic submission when time runs out.' },
    { q: 'How are questions generated?', a: 'Our question bank is curated by experienced educators. Each question comes with detailed explanations and concept references.' }
  ];

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Practice Smarter.<br /><span>Test Better.</span><br />Improve Faster.</h1>
            <p>Your comprehensive aptitude preparation platform. Master quantitative, logical, verbal, and data interpretation skills with smart practice, real-time analytics, and personalized learning paths.</p>
            <div className="hero-buttons">
              <Link to={user ? '/categories' : '/register'} className="btn btn-primary btn-lg">Start Practicing</Link>
              <Link to={user ? '/mock-tests' : '/register'} className="btn btn-secondary btn-lg">Take Mock Test</Link>
            </div>
            <div className="hero-stats-bar">
              <div className="hero-stat">
                <div className="hero-stat-value">{stats.totalQuestions || '500'}+</div>
                <div className="hero-stat-label">Questions</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">{stats.totalTests || '20'}+</div>
                <div className="hero-stat-label">Mock Tests</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">{stats.totalStudents || '100'}+</div>
                <div className="hero-stat-label">Students</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">{stats.totalCategories || '4'}</div>
                <div className="hero-stat-label">Categories</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <img src="/logo.png" alt="AptitudeHub" style={{ maxWidth: '350px' }} />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section" style={{ background: 'var(--bg-surface)' }}>
        <div className="container">
          <h2 className="section-title">Explore Categories</h2>
          <p className="section-subtitle">Choose from four major aptitude categories and start your preparation journey</p>
          <div className="grid-4">
            {categories.map((cat, i) => (
              <Link to="/categories" key={i} style={{ textDecoration: 'none' }}>
                <div className="category-card">
                  <div className="category-icon" style={{ background: `${cat.color}20` }}>
                    <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                  </div>
                  <h3 className="category-name">{cat.name}</h3>
                  <p className="category-desc">{cat.desc}</p>
                  <div className="category-meta">
                    <span className="category-count">{cat.name === 'Quantitative Aptitude' ? '12' : cat.name === 'Logical Reasoning' ? '10' : cat.name === 'Verbal Ability' ? '8' : '5'} Topics</span>
                    <span className="btn btn-sm btn-ghost">Explore →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Why AptitudeHub?</h2>
          <p className="section-subtitle">Everything you need to ace your aptitude tests in one platform</p>
          <div className="grid-4">
            {features.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" style={{ background: 'var(--bg-surface)' }}>
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Get started in minutes and begin improving your aptitude skills</p>
          <div className="steps-container">
            {steps.map((s, i) => (
              <div className="step-card" key={i}>
                <div className="step-number">{s.num}</div>
                <h4 className="step-title">{s.title}</h4>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">What Students Say</h2>
          <p className="section-subtitle">Hear from students who improved their aptitude skills with AptitudeHub</p>
          <div className="grid-3">
            {testimonials.map((t, i) => (
              <div className="testimonial-card" key={i}>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.avatar}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>Note: These are representative testimonials for demonstration purposes.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" style={{ background: 'var(--bg-surface)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">Find answers to common questions about AptitudeHub</p>
          {faqs.map((faq, i) => (
            <div className="faq-item" key={i}>
              <button className="faq-question" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                {faq.q}
                <span style={{ fontSize: '1.2rem', transition: 'transform 0.3s', transform: faqOpen === i ? 'rotate(180deg)' : 'none' }}>▼</span>
              </button>
              <div className={`faq-answer ${faqOpen === i ? 'open' : ''}`}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 className="section-title">Ready to Start Practicing?</h2>
          <p className="section-subtitle">Join thousands of students preparing smarter with AptitudeHub</p>
          <Link to={user ? '/dashboard' : '/register'} className="btn btn-primary btn-lg">
            {user ? 'Go to Dashboard' : 'Get Started Free'} →
          </Link>
        </div>
      </section>
    </>
  );
}
