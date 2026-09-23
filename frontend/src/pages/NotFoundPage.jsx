import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '6rem', fontWeight: 900, background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>404</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Page Not Found</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn-primary">← Go Home</Link>
      </div>
    </div>
  );
}
