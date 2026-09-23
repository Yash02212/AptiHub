import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { HiAcademicCap, HiChartBar, HiLightningBolt, HiFire, HiTrendingUp, HiClock } from 'react-icons/hi';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTests, setRecentTests] = useState([]);
  const [weakTopics, setWeakTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [progressRes, resultsRes, recsRes] = await Promise.all([
        API.get('/progress'),
        API.get('/results'),
        API.get('/progress/recommendations')
      ]);
      setStats(progressRes.data.data.stats);
      setRecentTests(resultsRes.data.data?.slice(0, 5) || []);
      setWeakTopics(recsRes.data.data?.weakTopics || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loader-container" style={{ paddingTop: '120px' }}><div className="spinner" /></div>;

  const dashStats = [
    { icon: <HiAcademicCap />, label: 'Tests Attempted', value: stats?.totalTests || 0, bg: 'rgba(37,99,235,0.15)', color: '#3B82F6' },
    { icon: <HiChartBar />, label: 'Avg Score', value: `${stats?.avgScore || 0}%`, bg: 'rgba(6,182,212,0.15)', color: '#06B6D4' },
    { icon: <HiTrendingUp />, label: 'Avg Accuracy', value: `${stats?.avgAccuracy || 0}%`, bg: 'rgba(16,185,129,0.15)', color: '#10B981' },
    { icon: <HiLightningBolt />, label: 'Questions Solved', value: stats?.totalQuestions || 0, bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
    { icon: <HiFire />, label: 'Current Streak', value: `${stats?.streak?.current || 0} days`, bg: 'rgba(239,68,68,0.15)', color: '#EF4444' },
    { icon: <HiClock />, label: 'Total XP', value: stats?.xp || 0, bg: 'rgba(124,58,237,0.15)', color: '#7C3AED' }
  ];

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-welcome">Welcome back, <span>{user?.name?.split(' ')[0]}</span> 👋</h1>
          <p className="dashboard-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Stats */}
        <div className="dashboard-stats">
          {dashStats.map((s, i) => (
            <div className="dash-stat-card" key={i}>
              <div className="dash-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div>
                <div className="dash-stat-value">{s.value}</div>
                <div className="dash-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>Quick Actions</h3>
        <div className="quick-actions">
          <Link to="/categories" className="quick-action-btn">
            <div className="quick-action-icon">📝</div>
            Start Practice
          </Link>
          <Link to="/mock-tests" className="quick-action-btn">
            <div className="quick-action-icon">📋</div>
            Take Mock Test
          </Link>
          <Link to="/daily-challenge" className="quick-action-btn">
            <div className="quick-action-icon">⚡</div>
            Daily Challenge
          </Link>
          <Link to="/analytics" className="quick-action-btn">
            <div className="quick-action-icon">📊</div>
            View Progress
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Recent Tests */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Recent Tests</h3>
            {recentTests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <p className="empty-state-title">No tests yet</p>
                <p className="empty-state-desc">Take your first test to see results here</p>
                <Link to="/mock-tests" className="btn btn-primary btn-sm">Take a Test</Link>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Score</th>
                    <th>Accuracy</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTests.map((t, i) => (
                    <tr key={i}>
                      <td style={{ color: 'var(--text-heading)', fontWeight: 500 }}>{t.test?.name || 'Test'}</td>
                      <td><span className={`badge ${t.percentage >= 70 ? 'badge-easy' : t.percentage >= 40 ? 'badge-medium' : 'badge-hard'}`}>{t.percentage}%</span></td>
                      <td>{t.accuracy}%</td>
                      <td>{new Date(t.submittedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Weak Topics */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Weak Topics</h3>
            {weakTopics.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 16px' }}>
                <div className="empty-state-icon">💪</div>
                <p className="empty-state-desc">Complete more tests to see weak topics</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {weakTopics.map((t, i) => (
                  <div key={i} style={{ padding: '12px 16px', background: 'var(--error-bg)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-heading)', marginBottom: '4px' }}>{t.topicName || t}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Accuracy: {t.accuracy || 0}%</div>
                    <div className="progress-bar" style={{ marginTop: '6px' }}>
                      <div className="progress-fill" style={{ width: `${t.accuracy || 0}%`, background: 'var(--error)' }} />
                    </div>
                  </div>
                ))}
                <Link to="/categories" className="btn btn-sm btn-primary" style={{ marginTop: '8px' }}>Practice Weak Topics</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
