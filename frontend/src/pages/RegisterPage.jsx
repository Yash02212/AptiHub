import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', college: '', year: '', branch: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill required fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const u = (field, value) => setForm({ ...form, [field]: value });

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-logo">
          <img src="/logo.png" alt="AptitudeHub" />
        </div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join AptitudeHub and start your preparation</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input type="text" className="form-input" placeholder="John Doe" value={form.name} onChange={e => u('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input type="email" className="form-input" placeholder="your@email.com" value={form.email} onChange={e => u('email', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input type="password" className="form-input" placeholder="••••••" value={form.password} onChange={e => u('password', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input type="password" className="form-input" placeholder="••••••" value={form.confirmPassword} onChange={e => u('confirmPassword', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">College / University</label>
            <input type="text" className="form-input" placeholder="Your college name" value={form.college} onChange={e => u('college', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Year</label>
              <select className="form-select" value={form.year} onChange={e => u('year', e.target.value)}>
                <option value="">Select Year</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
                <option>Graduate</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Branch</label>
              <input type="text" className="form-input" placeholder="e.g. CSE" value={form.branch} onChange={e => u('branch', e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
