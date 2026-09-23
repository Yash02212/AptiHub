import { useState, useEffect } from 'react';
import API from '../services/api';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/achievements').then(res => { setAchievements(res.data.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader-container" style={{ paddingTop: '120px' }}><div className="spinner" /></div>;

  const earned = achievements.filter(a => a.earned);
  const locked = achievements.filter(a => !a.earned);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1 className="page-title">🏆 Achievements</h1>
          <p className="page-subtitle">{earned.length} / {achievements.length} unlocked</p>
          <div className="progress-bar" style={{ maxWidth: '300px', margin: '16px auto 0' }}>
            <div className="progress-fill" style={{ width: `${achievements.length > 0 ? (earned.length / achievements.length) * 100 : 0}%` }} />
          </div>
        </div>

        {earned.length > 0 && (
          <>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--success)' }}>Earned</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {earned.map((a, i) => (
                <div className="achievement-card earned" key={i}>
                  <div className="achievement-icon">{a.icon}</div>
                  <div className="achievement-info">
                    <h4>{a.name}</h4>
                    <p>{a.description}</p>
                    <p style={{ color: 'var(--primary-teal)', fontSize: '0.8rem', marginTop: '4px' }}>+{a.xpReward} XP • {new Date(a.earnedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {locked.length > 0 && (
          <>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-muted)' }}>🔒 Locked</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {locked.map((a, i) => (
                <div className="achievement-card locked" key={i}>
                  <div className="achievement-icon">{a.icon}</div>
                  <div className="achievement-info">
                    <h4>{a.name}</h4>
                    <p>{a.description}</p>
                    <p style={{ color: 'var(--primary-teal)', fontSize: '0.8rem', marginTop: '4px' }}>+{a.xpReward} XP</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {achievements.length === 0 && (
          <div className="empty-state"><div className="empty-state-icon">🏆</div><p className="empty-state-title">No achievements available yet</p></div>
        )}
      </div>
    </div>
  );
}
