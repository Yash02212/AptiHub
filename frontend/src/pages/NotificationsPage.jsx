import { useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/notifications').then(res => { setNotifications(res.data.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await API.put('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All marked as read');
  };

  const icons = { test: '📝', challenge: '⚡', achievement: '🏆', streak: '🔥', result: '📊', system: '🔔' };

  if (loading) return <div className="loader-container" style={{ paddingTop: '120px' }}><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '700px' }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">🔔 Notifications</h1>
            <p className="page-subtitle">{notifications.filter(n => !n.read).length} unread</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>
        </div>
        {notifications.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🔔</div><p className="empty-state-title">No notifications</p></div>
        ) : notifications.map((n, i) => (
          <div key={i} className="card" style={{ marginBottom: '12px', borderLeft: n.read ? '3px solid transparent' : '3px solid var(--primary-teal)', background: n.read ? 'var(--bg-card)' : 'rgba(6,182,212,0.03)' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem' }}>{icons[n.type] || '🔔'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>{n.title}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{n.message}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '8px' }}>{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
