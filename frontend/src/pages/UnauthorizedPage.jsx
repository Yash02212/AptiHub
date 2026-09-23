import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔒</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Access Denied</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>You don't have permission to access this page.</p>
        <Link to="/" className="btn btn-primary">← Go Home</Link>
      </div>
    </div>
  );
}
