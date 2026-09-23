import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/logo.png" alt="AptitudeHub" />
            <p>Your comprehensive platform for aptitude preparation. Practice smarter, test better, and improve faster with AptitudeHub.</p>
            <div className="footer-social">
              <a href="#" aria-label="GitHub"><FaGithub /></a>
              <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
            </div>
          </div>
          <div className="footer-column">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/mock-tests">Mock Tests</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
          <div className="footer-column">
            <h4>Categories</h4>
            <Link to="/categories">Quantitative Aptitude</Link>
            <Link to="/categories">Logical Reasoning</Link>
            <Link to="/categories">Verbal Ability</Link>
            <Link to="/categories">Data Interpretation</Link>
          </div>
          <div className="footer-column">
            <h4>Support</h4>
            <Link to="/">About Us</Link>
            <Link to="/">Contact</Link>
            <Link to="/">Privacy Policy</Link>
            <Link to="/">Terms of Service</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} AptitudeHub. All rights reserved. Practice • Improve • Succeed</p>
        </div>
      </div>
    </footer>
  );
}
