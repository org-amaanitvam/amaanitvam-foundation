import { Outlet, Link, useLocation } from 'react-router-dom';
import { GraduationCap, Home, BookOpen, Gift } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const { pathname } = useLocation();

  const isActive = (path) => (pathname === path ? 'active' : '');

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="nav-inner">
          <Link to="/" className="brand">
            <img src="/images/Logo/logo.jpg" alt="Amaanitvam Foundation Logo" className="brand-logo" />
            <div className="brand-text">
              <span className="brand-name">AMAANITVAM</span>
              <span className="brand-subtitle">LMS</span>
            </div>
          </Link>
          <nav className="nav-links" aria-label="LMS navigation">
            <Link className={`nav-link ${isActive('/')}`} to="/">
              <Home size={18} /> Courses
            </Link>
            <a className="nav-link" href="https://www.amaanitvam.org/src/pages/programs.html" target="_blank" rel="noreferrer">
              <BookOpen size={18} /> Programs
            </a>
            <a className="nav-link nav-link--login" href="https://www.amaanitvam.org/src/pages/login.html" target="_blank" rel="noreferrer">
              Portal Login
            </a>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <GraduationCap size={28} className="footer-icon" />
            <span>Amaanitvam Foundation — Learning Management System</span>
          </div>
          <div className="footer-links">
            <Link to="/">Course Catalog</Link>
            <a href="https://www.amaanitvam.org/src/pages/contact.html" target="_blank" rel="noreferrer">Contact</a>
          </div>
          <a href="https://www.amaanitvam.org/src/pages/contact.html#donate" className="footer-donate" target="_blank" rel="noreferrer">
            <Gift size={16} /> Donate
          </a>
        </div>
      </footer>
    </div>
  );
}