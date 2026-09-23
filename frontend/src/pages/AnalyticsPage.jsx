import { useState, useEffect } from 'react';
import API from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const COLORS = ['#2563EB', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#7C3AED', '#EC4899', '#14B8A6'];

export default function AnalyticsPage() {
  const [progress, setProgress] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.get('/progress'), API.get('/progress/recommendations')]).then(([pRes, rRes]) => {
      setProgress(pRes.data.data);
      setStats(rRes.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader-container" style={{ paddingTop: '120px' }}><div className="spinner" /></div>;

  const scoreHistory = progress?.progress?.scoreHistory?.map((s, i) => ({
    name: `Test ${i + 1}`,
    score: s.percentage,
    accuracy: s.accuracy
  })) || [];

  const catPerf = stats?.categoryPerformance?.map(c => ({
    name: c.categoryName,
    accuracy: c.accuracy,
    attempted: c.totalAttempted
  })) || [];

  const diffPerf = progress?.progress?.difficultyPerformance;
  const diffData = diffPerf ? [
    { name: 'Easy', correct: diffPerf.easy?.correct || 0, total: diffPerf.easy?.attempted || 0 },
    { name: 'Medium', correct: diffPerf.medium?.correct || 0, total: diffPerf.medium?.attempted || 0 },
    { name: 'Hard', correct: diffPerf.hard?.correct || 0, total: diffPerf.hard?.attempted || 0 }
  ] : [];

  const topicPerf = progress?.progress?.topicPerformance?.slice(0, 8).map(t => ({
    name: t.topicName,
    accuracy: t.accuracy,
    attempted: t.totalAttempted
  })) || [];

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Performance Analytics</h1>
          <p className="page-subtitle">Track your progress and identify areas for improvement</p>
        </div>

        {/* Summary Stats */}
        <div className="dashboard-stats" style={{ marginBottom: '32px' }}>
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: 'rgba(37,99,235,0.15)', color: '#3B82F6' }}>📊</div>
            <div>
              <div className="dash-stat-value">{progress?.stats?.avgScore || 0}%</div>
              <div className="dash-stat-label">Avg Score</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>🎯</div>
            <div>
              <div className="dash-stat-value">{progress?.stats?.avgAccuracy || 0}%</div>
              <div className="dash-stat-label">Avg Accuracy</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>⚡</div>
            <div>
              <div className="dash-stat-value">{progress?.stats?.totalQuestions || 0}</div>
              <div className="dash-stat-label">Questions Solved</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: 'rgba(124,58,237,0.15)', color: '#7C3AED' }}>🏆</div>
            <div>
              <div className="dash-stat-value">{progress?.stats?.xp || 0}</div>
              <div className="dash-stat-label">Total XP</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Score History */}
          <div className="chart-card">
            <div className="chart-title">Score History</div>
            {scoreHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={scoreHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '8px', color: '#F1F5F9' }} />
                  <Line type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={2} dot={{ r: 4, fill: '#2563EB' }} />
                  <Line type="monotone" dataKey="accuracy" stroke="#06B6D4" strokeWidth={2} dot={{ r: 4, fill: '#06B6D4' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="empty-state" style={{ padding: '40px' }}><p>No data yet</p></div>}
          </div>

          {/* Category Performance */}
          <div className="chart-card">
            <div className="chart-title">Category Performance</div>
            {catPerf.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={catPerf}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={12} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '8px', color: '#F1F5F9' }} />
                  <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                    {catPerf.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="empty-state" style={{ padding: '40px' }}><p>No data yet</p></div>}
          </div>

          {/* Difficulty Performance */}
          <div className="chart-card">
            <div className="chart-title">Difficulty Breakdown</div>
            {diffData.some(d => d.total > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={diffData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '8px', color: '#F1F5F9' }} />
                  <Bar dataKey="correct" fill="#10B981" name="Correct" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total" fill="#3B82F6" name="Total" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="empty-state" style={{ padding: '40px' }}><p>No data yet</p></div>}
          </div>

          {/* Topic Performance */}
          <div className="chart-card">
            <div className="chart-title">Topic Performance</div>
            {topicPerf.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topicPerf} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis type="number" stroke="#64748B" fontSize={12} domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={11} width={100} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '8px', color: '#F1F5F9' }} />
                  <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                    {topicPerf.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="empty-state" style={{ padding: '40px' }}><p>No data yet</p></div>}
          </div>
        </div>

        {/* Strong & Weak Topics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--success)' }}>💪 Strong Topics</h3>
            {progress?.progress?.strongTopics?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {progress.progress.strongTopics.map((t, i) => <span key={i} className="badge badge-easy" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>{t}</span>)}
              </div>
            ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Complete more tests to see strong topics</p>}
          </div>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--error)' }}>⚠️ Weak Topics</h3>
            {progress?.progress?.weakTopics?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {progress.progress.weakTopics.map((t, i) => <span key={i} className="badge badge-hard" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>{t}</span>)}
              </div>
            ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Complete more tests to see weak topics</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
