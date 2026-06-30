import React, { useState, useEffect } from 'react';

const BOOT_LINES = [
  '> Initializing RouteResilience Engine v3.0...',
  '> Loading U-Net++ + Swin Transformer V2 model...',
  '> Connecting to satellite feed [ISRO/Cartosat-3 · Sentinel-2]...',
  '> Building road topology graph (N=12,847 nodes, E=18,234 edges)...',
  '> Running MST topological healing — connectivity +371%...',
  '> Computing betweenness centrality [Brandes O(VE)]...',
  '> Cascade failure engine: ONLINE',
  '> Urban vulnerability index: ONLINE',
  '> All systems nominal. Welcome to RouteResilience.',
];

export default function LoadingScreen() {
  const [lines, setLines] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setLines(prev => [...prev, BOOT_LINES[i]]);
        setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 320);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--c-void)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      fontFamily: 'var(--font-mono)',
    }}>
      {/* Animated rings */}
      <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 48 }}>
        <div style={{
          position: 'absolute', inset: 0,
          border: '2px solid rgba(56,189,248,0.2)',
          borderRadius: '50%',
          animation: 'spin-slow 8s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 16,
          border: '2px solid rgba(56,189,248,0.4)',
          borderTopColor: 'var(--c-cyan)',
          borderRadius: '50%',
          animation: 'spin-slow 3s linear infinite reverse',
        }} />
        <div style={{
          position: 'absolute', inset: 32,
          border: '1px solid var(--c-cyan)',
          borderRadius: '50%',
          background: 'rgba(56,189,248,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M3 9l4-4 4 4 4-4 4 4" stroke="var(--c-cyan)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M3 15l4 4 4-4 4 4 4-4" stroke="var(--c-amber)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.8rem',
          fontWeight: 800,
          color: 'var(--c-cyan)',
          letterSpacing: '-0.02em',
          marginBottom: 4,
        }}>
          ROUTE RESILIENCE
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--c-text-faint)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Urban Road Intelligence System
        </div>
      </div>

      {/* Boot terminal */}
      <div style={{
        width: 480,
        maxWidth: '90vw',
        background: 'rgba(13,22,48,0.8)',
        border: '1px solid var(--c-border)',
        borderRadius: 8,
        padding: '16px 20px',
        marginBottom: 24,
        minHeight: 180,
      }}>
        {lines.map((line, i) => (
          <div key={i} style={{
            fontSize: '0.75rem',
            color: i === lines.length - 1 ? 'var(--c-cyan)' : 'var(--c-text-faint)',
            marginBottom: 6,
            opacity: i === lines.length - 1 ? 1 : 0.7,
          }}>
            {line}
          </div>
        ))}
        {lines.length < BOOT_LINES.length && (
          <span style={{ color: 'var(--c-cyan)', animation: 'pulse-dot 1s infinite' }}>▋</span>
        )}
      </div>

      {/* Progress */}
      <div style={{ width: 480, maxWidth: '90vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--c-text-faint)' }}>LOADING PIPELINE</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--c-cyan)' }}>{progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
