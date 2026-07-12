import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import PipelinePage from './components/PipelinePage';
import SimulationPage from './components/SimulationPage';
import AboutPage from './components/AboutPage';
import LoadingScreen from './components/LoadingScreen';
import CascadeSimulator from './components/CascadeSimulator';
import CityComparison from './components/CityComparison';
import ScorePage from './components/ScorePage';
import UseCasePage from './components/UseCasePage';
import EmergencyPage from './components/EmergencyPage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--c-void)', color: '#fff', padding: '24px' }}>
          <div className="glass-panel" style={{ padding: '36px', maxWidth: '480px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <h2 style={{ marginBottom: '16px', color: 'var(--c-red)' }}>Something went wrong.</h2>
            <p style={{ color: 'var(--c-text-dim)', marginBottom: '24px' }}>An unexpected error occurred in this view.</p>
            <a href="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>Return to Home</a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}



function RoutesWrapper() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/"           element={<LandingPage />} />
          <Route path="/dashboard"  element={<Dashboard />} />
          <Route path="/pipeline"   element={<PipelinePage />} />
          <Route path="/simulation" element={<SimulationPage />} />
          <Route path="/about"      element={<AboutPage />} />
          <Route path="/cascade"    element={<CascadeSimulator />} />
          <Route path="/compare"    element={<CityComparison />} />
          <Route path="/score"      element={<ScorePage />} />
          <Route path="/usecases"   element={<UseCasePage />} />
          <Route path="/emergency"  element={<EmergencyPage />} />
        </Routes>
      </div>
      {!isLanding && (
        <footer style={{
          background: 'rgba(2, 4, 10, 0.95)',
          borderTop: '1px solid var(--c-border)',
          padding: '24px 20px',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: 'var(--c-text-dim)',
          fontFamily: 'var(--font-mono)',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <div>
              RouteResilience © 2026 · Smart City Intelligence Platform · Built for Lenovo Hackathon
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <a href="https://github.com/adityakulkarni3618/RouteResilience.git" target="_blank" rel="noreferrer" style={{ color: 'var(--c-cyan)', textDecoration: 'none' }}>GitHub Repo</a>
              <span style={{ color: 'var(--c-text-faint)' }}>|</span>
              <a href="https://route-resilience-tau.vercel.app" target="_blank" rel="noreferrer" style={{ color: 'var(--c-cyan)', textDecoration: 'none' }}>Live Demo</a>
              <span style={{ color: 'var(--c-text-faint)' }}>|</span>
              <a href="https://routeresilience-1.onrender.com/docs" target="_blank" rel="noreferrer" style={{ color: 'var(--c-cyan)', textDecoration: 'none' }}>API Docs</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [showLiveFeed, setShowLiveFeed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'R' || e.key === 'r')) {
        e.preventDefault();
        setShowLiveFeed(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowLiveFeed(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <Router>
      <div className="grid-overlay" />
      <Navigation />
      <ErrorBoundary>
        <RoutesWrapper />
      </ErrorBoundary>
      {showLiveFeed && <LiveFeedModal onClose={() => setShowLiveFeed(false)} />}
    </Router>
  );
}

function LiveFeedModal({ onClose }) {
  const [logs, setLogs] = useState([]);
  const containerRef = React.useRef(null);

  useEffect(() => {
    const nodes = ["Silk Board Junction", "Hebbal Flyover", "KR Puram Bridge", "Marathahalli Crossing", "Electronic City Highway", "Bannerghatta Sector", "Whitefield Hub", "Yelahanka Link"];
    const devices = ["CCTV-Telemetry", "VIBRATION-Sensor", "RADAR-Scanner", "MET-Anemometer"];
    
    const generateLog = () => {
      const timestamp = new Date().toLocaleTimeString() + '.' + String(Math.floor(Math.random() * 1000)).padStart(3, '0');
      const node = nodes[Math.floor(Math.random() * nodes.length)];
      const dev = devices[Math.floor(Math.random() * devices.length)];
      
      let message = "";
      let type = "info";
      
      switch (dev) {
        case "CCTV-Telemetry":
          const flow = Math.floor(20 + Math.random() * 80);
          message = `CCTV flow rate check at [${node}]: ${flow} vehicles/min`;
          break;
        case "VIBRATION-Sensor":
          const vib = (0.005 + Math.random() * 0.04).toFixed(4);
          message = `Structural vibration reading at [${node}]: ${vib}g (status: STABLE)`;
          break;
        case "RADAR-Scanner":
          const speed = Math.floor(30 + Math.random() * 50);
          message = `Radar scanner speed check at [${node}]: avg speed ${speed} km/h`;
          break;
        case "MET-Anemometer":
          const temp = (24 + Math.random() * 8).toFixed(1);
          message = `Atmospheric telemetry check at [${node}]: road temp ${temp}°C`;
          break;
        default:
          message = "System ping OK";
      }

      if (Math.random() > 0.88) {
        type = "warning";
        message = `⚠️ ALERT: High commuter density trigger threshold (>85%) breached at [${node}]`;
      }

      return { timestamp, device: dev, message, type };
    };

    setLogs(Array.from({ length: 12 }, generateLog));

    const interval = setInterval(() => {
      setLogs(prev => {
        const next = [...prev, generateLog()];
        if (next.length > 80) next.shift();
        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(2, 4, 10, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: 720,
        height: 480,
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        background: 'rgba(6, 10, 19, 0.95)',
        border: '1px solid var(--c-cyan)',
        boxShadow: '0 0 30px rgba(0, 229, 255, 0.15)',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'rgba(0, 229, 255, 0.05)',
          borderBottom: '1px solid var(--c-border-bright)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ animation: 'pulse-dot 1s infinite alternate', width: 8, height: 8, borderRadius: '50%', background: 'var(--c-cyan)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--c-cyan)', letterSpacing: '0.08em' }}>
              LIVE ORBITAL FEED & IoT TELEMETRY
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--c-text-faint)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            [ CLOSE / ESC ]
          </button>
        </div>

        {/* Terminal Body */}
        <div
          ref={containerRef}
          style={{
            padding: 20,
            overflowY: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            lineHeight: 1.6,
            background: 'rgba(2, 4, 10, 0.6)',
          }}
        >
          {logs.map((log, i) => (
            <div key={i} style={{ marginBottom: 6, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--c-text-faint)', whiteSpace: 'nowrap' }}>[{log.timestamp}]</span>
              <span style={{ color: 'var(--c-purple)', whiteSpace: 'nowrap', fontWeight: 600 }}>{log.device}</span>
              <span style={{ color: log.type === 'warning' ? '#f59e0b' : 'var(--c-text-dim)' }}>
                {log.message}
              </span>
            </div>
          ))}
        </div>

        {/* Terminal Footer */}
        <div style={{
          padding: '12px 20px',
          background: 'rgba(0, 229, 255, 0.02)',
          borderTop: '1px solid var(--c-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          color: 'var(--c-text-faint)'
        }}>
          <span>CCTV & DSRC BROADCAST LAYER active // BENGALURU CBD SECTOR</span>
          <span>SYSTEM TEMPERATURE: 38.4°C</span>
        </div>
      </div>
    </div>
  );
}
