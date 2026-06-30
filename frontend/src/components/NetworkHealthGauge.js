import React, { useState, useEffect } from 'react';

/**
 * NetworkHealthGauge - A premium pure SVG animated semicircular gauge.
 * 
 * Props:
 * - R: float between 0.0 and 1.0 (Resilience Index)
 * - label: string label below the gauge
 * - size: number for component width (default 200)
 */
export default function NetworkHealthGauge({ R, label, size = 200 }) {
  // Clamp R between 0 and 1
  const targetR = Math.max(0, Math.min(1, typeof R === 'number' ? R : 0));
  const [animatedR, setAnimatedR] = useState(0);

  useEffect(() => {
    // Small delay to trigger mount animation transition
    const timer = setTimeout(() => {
      setAnimatedR(targetR);
    }, 100);
    return () => clearTimeout(timer);
  }, [targetR]);

  // Semicircle arc calculations:
  // Center: (100, 100), Radius: 75.
  // Arc length = PI * R = 3.14159 * 75 = 235.62
  const r = 75;
  const strokeLength = Math.PI * r; // 235.62
  const strokeDashoffset = strokeLength * (1 - animatedR);

  // Needle angle: -90 degrees (at R=0) to 90 degrees (at R=1)
  const needleAngle = -90 + animatedR * 180;

  // Grade classification helper
  const getGrade = (val) => {
    if (val >= 0.85) return { letter: 'A', color: 'var(--c-green)', desc: 'Excellent Resilience' };
    if (val >= 0.70) return { letter: 'B', color: 'var(--c-green)', desc: 'Good Resilience' };
    if (val >= 0.55) return { letter: 'C', color: 'var(--c-amber)', desc: 'Moderate Risk' };
    if (val >= 0.40) return { letter: 'D', color: 'var(--c-amber)', desc: 'High Risk' };
    return { letter: 'F', color: 'var(--c-red)', desc: 'Critical Degradation' };
  };

  const grade = getGrade(targetR);

  return (
    <div style={{ width: size, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg
        viewBox="0 0 200 135"
        width="100%"
        height="100%"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Semicircular gradient from red to green */}
          <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--c-red)" />
            <stop offset="50%" stopColor="var(--c-amber)" />
            <stop offset="100%" stopColor="var(--c-green)" />
          </linearGradient>
          
          {/* Subtle drop shadow for the gauge needle */}
          <filter id="needle-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* 1. Thin Outer Track (gray) */}
        <path
          d="M 25 100 A 75 75 0 0 1 175 100"
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* 2. Active Filled Arc (animated gradient) */}
        <path
          d="M 25 100 A 75 75 0 0 1 175 100"
          fill="none"
          stroke="url(#gauge-gradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${strokeLength} ${strokeLength}`}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.25, 0.8, 0.25, 1)',
          }}
        />

        {/* 3. Center R-Value (Large numeric text) */}
        <text
          x="100"
          y="78"
          textAnchor="middle"
          style={{
            fill: 'var(--c-text)',
            fontSize: '1.5rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}
        >
          {targetR.toFixed(3)}
        </text>

        {/* 4. Grade Letter Overlay */}
        <text
          x="100"
          y="95"
          textAnchor="middle"
          style={{
            fill: grade.color,
            fontSize: '1.15rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            letterSpacing: '0.05em',
          }}
        >
          GRADE {grade.letter}
        </text>

        {/* 5. Gauge Needle (triangular pointer) */}
        <g
          style={{
            transform: `rotate(${needleAngle}deg)`,
            transformOrigin: '100px 100px',
            transition: 'transform 1s cubic-bezier(0.25, 0.8, 0.25, 1)',
          }}
          filter="url(#needle-shadow)"
        >
          {/* Triangular needle body */}
          <polygon
            points="98,100 100,30 102,100"
            fill="var(--c-text)"
            stroke="var(--c-void)"
            strokeWidth="0.5"
          />
          {/* Needle pivot center cap */}
          <circle
            cx="100"
            cy="100"
            r="4.5"
            fill="var(--c-text)"
          />
        </g>

        {/* 6. Label Text Below Gauge */}
        {label && (
          <text
            x="100"
            y="124"
            textAnchor="middle"
            style={{
              fill: 'var(--c-text-faint)',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {label}
          </text>
        )}
      </svg>
    </div>
  );
}
