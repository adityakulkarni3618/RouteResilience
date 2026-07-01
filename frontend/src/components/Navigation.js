import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/pipeline', label: 'Pipeline' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/simulation', label: 'Simulation' },
  { path: '/compare', label: 'Compare' },
  { path: '/score', label: 'Score' },
  { path: '/about', label: 'About' },
  { path: '/cascade', label: 'Cascade' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  return (
    <nav className={scrolled ? 'scrolled' : ''}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', maxWidth: 1280, margin: '0 auto',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38,
            border: '2px solid var(--c-orange)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,138,55,0.1)',
            boxShadow: '0 0 10px rgba(255,138,55,0.15)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="5" cy="12" r="2" fill="var(--c-orange)" />
              <circle cx="12" cy="5" r="2" fill="var(--c-cyan)" />
              <circle cx="19" cy="12" r="2" fill="var(--c-orange)" />
              <circle cx="12" cy="19" r="2" fill="var(--c-cyan)" />
              <line x1="7" y1="11" x2="10" y2="7" stroke="rgba(255,138,55,0.4)" strokeWidth="1.5"/>
              <line x1="14" y1="7" x2="17" y2="11" stroke="rgba(0,229,255,0.4)" strokeWidth="1.5"/>
              <line x1="17" y1="13" x2="14" y2="17" stroke="rgba(255,138,55,0.4)" strokeWidth="1.5"/>
              <line x1="10" y1="17" x2="7" y2="13" stroke="rgba(0,229,255,0.4)" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '0.95rem',
              color: 'var(--c-text)',
              letterSpacing: '0.05em',
            }}>
              RouteResilience
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.58rem',
              color: 'var(--c-text-faint)',
              letterSpacing: '0.12em',
            }}>
              ANTARIKSH GEOSPATIAL LAB
            </div>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hide-mobile nav-links-wrap">
          {NAV_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link-item ${location.pathname === link.path ? 'active' : ''}`}
              style={{
                color: location.pathname === link.path ? 'var(--c-orange)' : 'var(--c-text-dim)',
                background: location.pathname === link.path ? 'rgba(255,138,55,0.1)' : 'transparent',
                border: location.pathname === link.path ? '1px solid rgba(255,138,55,0.2)' : '1px solid transparent',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA + Status */}
        <div className="hide-mobile nav-cta-wrap" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="status-dot online" style={{ background: 'var(--c-green)', boxShadow: '0 0 8px var(--c-green)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--c-text-dim)', letterSpacing: '0.05em' }}>
              ORBIT LIVE
            </span>
          </div>
          <Link to="/dashboard" className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.72rem' }}>
            PORTAL CONSOLE
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
          className="show-mobile"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 22, height: 2, background: 'var(--c-cyan)', borderRadius: 1 }} />
            ))}
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(8,15,30,0.98)',
          borderTop: '1px solid var(--c-border)',
          padding: '16px 24px',
        }}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                display: 'block',
                padding: '12px 0',
                borderBottom: '1px solid var(--c-border)',
                textDecoration: 'none',
                color: location.pathname === link.path ? 'var(--c-cyan)' : 'var(--c-text-dim)',
                fontSize: '0.95rem',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
