import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('global');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/leaderboard?type=${tab}`);
      setData(res.data.data || []);
    } catch { setData([]); }
    setLoading(false);
  };

  const getRankClass = (r) => r === 1 ? 'gold' : r === 2 ? 'silver' : r === 3 ? 'bronze' : '';
  const getRankEmoji = (r) => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : `#${r}`;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1 className="page-title">🏆 Leaderboard</h1>
          <p className="page-subtitle">See how you rank among other students</p>
        </div>

        <div className="tabs" style={{ maxWidth: '500px', margin: '0 auto 32px' }}>
          {['global', 'weekly', 'monthly', 'college'].map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loader-container"><div className="spinner" /></div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏆</div>
            <p className="empty-state-title">No rankings yet</p>
            <p className="empty-state-desc">Complete tests to appear on the leaderboard</p>
          </div>
        ) : (
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <table className="leaderboard-table" style={{ borderSpacing: '0' }}>
              <thead>
                <tr>
                  <th style={{ paddingLeft: '24px' }}>Rank</th>
                  <th>Student</th>
                  {tab === 'global' && <th>XP</th>}
                  {(tab === 'weekly' || tab === 'monthly') && <th>Score</th>}
                  <th>Tests</th>
                  {tab === 'global' && <th>Streak</th>}
                  {(tab === 'weekly' || tab === 'monthly') && <th>Avg %</th>}
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => {
                  const rank = item.rank || i + 1;
                  const name = item.name || item.user?.name || 'Student';
                  const isMe = user && (item.user?._id === user.id || item.name === user.name);
                  return (
                    <tr key={i} style={isMe ? { background: 'rgba(6,182,212,0.05)' } : {}}>
                      <td style={{ paddingLeft: '24px' }}>
                        <span className={`leaderboard-rank ${getRankClass(rank)}`}>{getRankEmoji(rank)}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="navbar-avatar" style={{ width: '36px', height: '36px', fontSize: '0.8rem' }}>{name.charAt(0)}</div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{name} {isMe && <span className="badge badge-teal" style={{ marginLeft: '8px' }}>You</span>}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.college || item.user?.college || ''}</div>
                          </div>
                        </div>
                      </td>
                      {tab === 'global' && <td style={{ fontWeight: 700, color: 'var(--primary-teal)' }}>{item.xp || 0}</td>}
                      {(tab === 'weekly' || tab === 'monthly') && <td style={{ fontWeight: 700, color: 'var(--primary-teal)' }}>{item.totalScore || 0}</td>}
                      <td>{item.testsCompleted || 0}</td>
                      {tab === 'global' && <td><span className="streak-display" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>🔥 {item.streak || 0}</span></td>}
                      {(tab === 'weekly' || tab === 'monthly') && <td>{item.avgPercentage || 0}%</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
