import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const PRIMARY_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/pipeline', label: 'Pipeline' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/simulation', label: 'Simulation' },
  { path: '/usecases', label: 'USE CASES' },
  { path: '/emergency', label: 'EMERGENCY' },
];

const SECONDARY_LINKS = [
  { path: '/compare', label: 'Compare' },
  { path: '/score', label: 'Score' },
  { path: '/about', label: 'About' },
  { path: '/cascade', label: 'Cascade' },
];

const NAV_LINKS = [...PRIMARY_LINKS, ...SECONDARY_LINKS];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [secondaryOpen, setSecondaryOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSecondaryOpen(false);
  }, [location]);

  return (
    <nav className={scrolled ? 'scrolled' : ''}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', maxWidth: 1440, margin: '0 auto',
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
              whiteSpace: 'nowrap',
            }}>
              RouteResilience
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.55rem',
              color: 'var(--c-text-faint)',
              letterSpacing: '0.08em',
              whiteSpace: 'nowrap',
            }}>
              SMART CITY INTELLIGENCE PLATFORM
            </div>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hide-mobile nav-links-wrap" style={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'center', gap: '8px' }}>
          {PRIMARY_LINKS.map(link => {
            const isEmergency = link.path === '/emergency';
            const isActive = location.pathname === link.path;
            
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link-item ${isActive ? 'active' : ''}`}
                style={{
                  color: isEmergency ? '#ffffff' : (isActive ? 'var(--c-cyan)' : 'var(--c-text-dim)'),
                  background: isEmergency 
                    ? (isActive ? 'rgba(239, 68, 68, 0.35)' : 'rgba(239, 68, 68, 0.18)') 
                    : (isActive ? 'rgba(0, 229, 255, 0.08)' : 'transparent'),
                  border: isEmergency 
                    ? `1px solid ${isActive ? 'rgba(239, 68, 68, 0.8)' : 'rgba(239, 68, 68, 0.4)'}` 
                    : `1px solid ${isActive ? 'rgba(0, 229, 255, 0.25)' : 'transparent'}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  minWidth: 0,
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontWeight: isEmergency ? '700' : '600',
                  boxShadow: isEmergency && isActive ? '0 0 10px rgba(239, 68, 68, 0.2)' : 'none',
                  fontSize: '0.72rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {isEmergency && (
                  <span style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#ef4444',
                    marginRight: 6,
                    boxShadow: '0 0 6px #ef4444',
                    animation: 'pulse-dot 1s infinite alternate'
                  }} />
                )}
                {link.label}
              </Link>
            );
          })}

          {/* Secondary links visible on wide screens (> 1200px) */}
          <div className="nav-secondary-links" style={{ display: 'flex', gap: '8px' }}>
            {SECONDARY_LINKS.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link-item ${isActive ? 'active' : ''}`}
                  style={{
                    color: isActive ? 'var(--c-cyan)' : 'var(--c-text-dim)',
                    background: isActive ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(0, 229, 255, 0.25)' : 'transparent'}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    minWidth: 0,
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '0.72rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Secondary links toggle button visible on < 1200px */}
          <div style={{ position: 'relative' }} className="nav-secondary-toggle">
            <button
              onClick={() => setSecondaryOpen(!secondaryOpen)}
              style={{
                background: 'rgba(0, 229, 255, 0.05)',
                border: '1px solid rgba(0, 229, 255, 0.25)',
                borderRadius: '6px',
                color: 'var(--c-cyan)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                padding: '5px 12px',
                display: 'flex',
                alignItems: 'center',
                fontWeight: '600',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 229, 255, 0.12)';
                e.currentTarget.style.borderColor = 'var(--c-cyan)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 229, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.25)';
              }}
            >
              MORE ≡
            </button>
            {secondaryOpen && (
              <div className="glass-panel" style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 8,
                background: 'rgba(8,15,30,0.98)', border: '1px solid var(--c-cyan)',
                borderRadius: 8, padding: '8px 0', zIndex: 100, display: 'flex', flexDirection: 'column',
                minWidth: 140,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
              }}>
                {SECONDARY_LINKS.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`nav-link-item ${location.pathname === link.path ? 'active' : ''}`}
                    onClick={() => setSecondaryOpen(false)}
                    style={{
                      color: location.pathname === link.path ? 'var(--c-cyan)' : 'var(--c-text-dim)',
                      background: location.pathname === link.path ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                      padding: '8px 16px', display: 'block', textDecoration: 'none',
                      fontSize: '0.72rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase',
                      textAlign: 'left',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA + Status */}
        <div className="hide-mobile nav-cta-wrap" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="nav-status-badge" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="status-dot online" style={{ background: 'var(--c-green)', boxShadow: '0 0 8px var(--c-green)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--c-text-dim)', letterSpacing: '0.05em' }}>
              SYSTEM ACTIVE
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
                display: 'flex',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid var(--c-border)',
                textDecoration: 'none',
                color: link.path === '/emergency' ? '#ef4444' : (location.pathname === link.path ? 'var(--c-cyan)' : 'var(--c-text-dim)'),
                fontSize: '0.95rem',
              }}
            >
              {link.path === '/emergency' && (
                <span style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#ef4444',
                  marginRight: 6,
                  animation: 'pulse-dot 1.5s infinite alternate'
                }} />
              )}
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
