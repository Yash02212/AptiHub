import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { HiMenu, HiX, HiBell } from 'react-icons/hi';
import API from '../../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    if (user) {
      API.get('/notifications').then(res => {
        setUnreadCount(res.data.unreadCount || 0);
      }).catch(() => {});
    }
  }, [user, location]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';
  const isAdmin = user?.role === 'admin';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="AptitudeHub" />
        </Link>

        <div className="navbar-links">
          {!isAdmin && (
            <>
              <Link to="/" className={isActive('/')}>Home</Link>
              <Link to="/categories" className={isActive('/categories')}>Categories</Link>
              <Link to="/mock-tests" className={isActive('/mock-tests')}>Mock Tests</Link>
              <Link to="/leaderboard" className={isActive('/leaderboard')}>Leaderboard</Link>
            </>
          )}
          {user && !isAdmin && (
            <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
          )}
          {isAdmin && (
            <Link to="/admin" className={isActive('/admin')}>Admin Panel</Link>
          )}
        </div>

        <div className="navbar-auth">
          {!user ? (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          ) : (
            <>
              {!isAdmin && (
                <Link to="/notifications" className="notification-badge" style={{ color: 'var(--text-secondary)', fontSize: '1.3rem' }}>
                  <HiBell />
                  {unreadCount > 0 && <span className="count">{unreadCount}</span>}
                </Link>
              )}
              <div className="navbar-user" ref={dropdownRef} onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="navbar-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{user.name?.split(' ')[0]}</span>
                {dropdownOpen && (
                  <div className="navbar-dropdown">
                    {!isAdmin && (
                      <>
                        <Link to="/dashboard">📊 Dashboard</Link>
                        <Link to="/profile">👤 Profile</Link>
                        <Link to="/achievements">🏆 Achievements</Link>
                        <Link to="/bookmarks">🔖 Bookmarks</Link>
                        <div className="divider" />
                      </>
                    )}
                    {isAdmin && (
                      <>
                        <Link to="/admin">📊 Admin Dashboard</Link>
                        <Link to="/admin/questions">❓ Questions</Link>
                        <Link to="/admin/tests">📝 Tests</Link>
                        <div className="divider" />
                      </>
                    )}
                    <button onClick={handleLogout}>🚪 Logout</button>
                  </div>
                )}
              </div>
            </>
          )}
          <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-nav">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/categories" className={isActive('/categories')}>Categories</Link>
          <Link to="/mock-tests" className={isActive('/mock-tests')}>Mock Tests</Link>
          <Link to="/leaderboard" className={isActive('/leaderboard')}>Leaderboard</Link>
          {user && !isAdmin && (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
              <Link to="/analytics" className={isActive('/analytics')}>Analytics</Link>
              <Link to="/daily-challenge" className={isActive('/daily-challenge')}>Daily Challenge</Link>
              <Link to="/bookmarks" className={isActive('/bookmarks')}>Bookmarks</Link>
              <Link to="/profile" className={isActive('/profile')}>Profile</Link>
            </>
          )}
          {isAdmin && <Link to="/admin" className={isActive('/admin')}>Admin Panel</Link>}
          {!user ? (
            <>
              <Link to="/login" className={isActive('/login')}>Login</Link>
              <Link to="/register" className={isActive('/register')}>Register</Link>
            </>
          ) : (
            <button onClick={handleLogout}>Logout</button>
          )}
        </div>
      )}
    </nav>
  );
}
