import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', college: user?.college || '', year: user?.year || '', branch: user?.branch || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.put('/auth/profile', form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally { setSaving(false); }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="page-header" style={{ textAlign: 'center' }}>
          <div className="navbar-avatar" style={{ width: '80px', height: '80px', fontSize: '2rem', margin: '0 auto 16px', background: 'var(--gradient-brand)' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h1 className="page-title">{user?.name}</h1>
          <p className="page-subtitle">{user?.email}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
            <span className="badge badge-teal">{user?.role}</span>
            <span className="streak-display">🔥 {user?.streak?.current || 0} day streak</span>
            <span className="badge badge-primary">{user?.xp || 0} XP</span>
          </div>
        </div>

        <div className="card" style={{ marginTop: '32px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Edit Profile</h3>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">College / University</label>
              <input type="text" className="form-input" value={form.college} onChange={e => setForm({ ...form, college: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Year</label>
                <select className="form-select" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}>
                  <option value="">Select</option>
                  <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option><option>Graduate</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Branch</label>
                <input type="text" className="form-input" value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="card" style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Account Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tests Attempted</span><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user?.totalTestsAttempted || 0}</div></div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Questions Solved</span><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user?.totalQuestionsSolved || 0}</div></div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Longest Streak</span><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user?.streak?.longest || 0} days</div></div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Member Since</span><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
