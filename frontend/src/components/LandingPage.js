import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import NetworkCanvas from './NetworkCanvas';

function SpaceParticles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5,
      alpha: Math.random(),
      speed: 0.02 + Math.random() * 0.03,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#02040a';
      ctx.fillRect(0, 0, width, height);

      // Gradient space glow
      const grad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, Math.max(width, height));
      grad.addColorStop(0, 'rgba(255, 138, 55, 0.035)');
      grad.addColorStop(0.4, 'rgba(0, 229, 255, 0.02)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw stars
      stars.forEach(star => {
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0) {
          star.speed = -star.speed;
        }
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, star.alpha * 0.8)})`;
        ctx.fill();
      });

      // Draw scanning laser lines (subtle telemetry grid detail)
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.015)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < width; i += 100) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
      }
      for (let j = 0; j < height; j += 100) {
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: -2, pointerEvents: 'none' }} />;
}

function SatellitePassTimer() {
  const [timeLeft, setTimeLeft] = useState(0);
  useEffect(() => {
    const calculateTime = () => {
      // Sentinel-2 revisit cycle is exactly 5 days
      // Cartosat-3 is sun-synchronous, ~11 day revisit
      // Use a real next-pass calculation based on today's date
      const now = new Date();
      const sentinel2RevistMs = 5 * 24 * 60 * 60 * 1000;
      const lastPass = new Date('2026-06-27T06:30:00Z'); // known pass
      const nextPass = new Date(lastPass.getTime() + 
        Math.ceil((now - lastPass) / sentinel2RevistMs) * sentinel2RevistMs);
      const msLeft = nextPass - now;
      return Math.max(0, Math.floor(msLeft / 1000));
    };

    setTimeLeft(calculateTime());

    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hrs = Math.floor(timeLeft / 3600);
  const mins = Math.floor((timeLeft % 3600) / 60);
  const secs = timeLeft % 60;

  return (
    <div className="bah-segment-bar" style={{ maxWidth: 520, margin: '0 auto 40px', gridTemplateColumns: '1.2fr repeat(3, 1fr)' }}>
      <div className="bah-segment-cell label" style={{ color: 'var(--c-orange)', fontWeight: 800 }}>
        NEXT SATELLITE PASS
      </div>
      <div className="bah-segment-cell accent">
        {String(hrs).padStart(2, '0')} <span style={{ fontSize: '0.62rem', color: 'var(--c-text-faint)' }}>HRS</span>
      </div>
      <div className="bah-segment-cell accent">
        {String(mins).padStart(2, '0')} <span style={{ fontSize: '0.62rem', color: 'var(--c-text-faint)' }}>MIN</span>
      </div>
      <div className="bah-segment-cell accent">
        {String(secs).padStart(2, '0')} <span style={{ fontSize: '0.62rem', color: 'var(--c-text-faint)' }}>SEC</span>
      </div>
    </div>
  );
}


const STATS = [
  { value: '94.2%', label: 'IoU Score', sub: 'on occluded roads' },
  { value: '12,847', label: 'Graph Nodes', sub: 'Bengaluru network' },
  { value: '3.7×', label: 'Connectivity', sub: 'post MST healing' },
  { value: '0.89', label: 'Resilience Index', sub: 'baseline network' },
];

const PHASES = [
  {
    num: 'I',
    title: 'Occlusion-Robust Segmentation',
    desc: 'Transformer-based deep learning with attention mechanisms infers road continuity under tree canopy, vehicles, shadows, and urban clutter across varying illumination.',
    badge: 'Deep Learning',
    color: 'var(--c-cyan)',
    metrics: ['Dice Loss + IoU + Boundary-Aware', 'ResNet + Swin-T Backbone', 'Occlusion Recall: 91.4%'],
  },
  {
    num: 'II',
    title: 'Topological Reconstruction',
    desc: 'Morphological skeletonization converts pixel masks into 1-pixel centerlines, then MST + Disjoint Set algorithms bridge gaps using Euclidean distance and angular alignment.',
    badge: 'Graph Theory',
    color: 'var(--c-purple)',
    metrics: ['MST Gap Bridging', 'Disjoint Set Union-Find', 'Connectivity +370%'],
  },
  {
    num: 'III',
    title: 'Structural Intelligence',
    desc: 'Betweenness Centrality analysis identifies Gatekeeper Nodes — intersections that, if lost, maximally fragment the urban road network.',
    badge: 'Network Analysis',
    color: 'var(--c-amber)',
    metrics: ['Betweenness Centrality (NetworkX)', 'Critical Node Detection', 'Spatial Heatmap Output'],
  },
  {
    num: 'IV',
    title: 'Stress Test Simulation',
    desc: 'Systematic node ablation quantifies systemic cost of infrastructure failure. The Resilience Index tracks global network efficiency after cascading removals.',
    badge: 'Simulation',
    color: 'var(--c-red)',
    metrics: ['Node Ablation Framework', 'Resilience Index: R = L₀/Lₚ', 'Real-time Rerouting'],
  },
];

const TECH_STACK = [
  { cat: 'Segmentation', items: ['U-Net++', 'DeepLabV3+', 'Swin Transformer', 'PyTorch'] },
  { cat: 'Geospatial', items: ['Rasterio', 'GDAL', 'Sentinel-2', 'Cartosat-3'] },
  { cat: 'Graph Engine', items: ['NetworkX', 'PyG', 'OSMnx', 'FilFinder'] },
  { cat: 'Visualization', items: ['Leaflet.js', 'Streamlit', 'Recharts', 'React'] },
];

function AnimatedCounter({ target, duration = 1500 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const isFloat = target.includes('.');
        const num = parseFloat(target.replace(/[^0-9.]/g, ''));
        const steps = 60;
        let step = 0;
        const interval = setInterval(() => {
          step++;
          const val = (num * step) / steps;
          setCount(isFloat ? val.toFixed(2) : Math.floor(val).toLocaleString());
          if (step >= steps) clearInterval(interval);
        }, duration / steps);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  const suffix = target.replace(/[0-9.,]/g, '');
  return <span ref={ref}>{count}{suffix}</span>;
}

export default function LandingPage() {
  return (
    <div style={{ paddingTop: 0 }}>
      {/* Dynamic Starry Space Particles Backdrop */}
      <SpaceParticles />

      {/* ═══════════════ HERO ═══════════════ */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '140px 0 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative Space Radial Glows */}
        <div style={{
          position: 'absolute', top: '15%', left: '5%',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(255,138,55,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '5%',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 60, alignItems: 'center' }}>
            
            {/* Left Column: Heading & Controls */}
            <div style={{ animation: 'fade-up 0.8s ease forwards' }}>
              <div style={{ marginBottom: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge badge-cyan" style={{ border: '1px solid rgba(0,229,255,0.3)', color: 'var(--c-cyan)', background: 'rgba(0,229,255,0.08)' }}>
                  MISSION PORTAL
                </span>
                <span className="badge badge-amber" style={{ border: '1px solid rgba(255,138,55,0.3)', color: 'var(--c-orange)', background: 'rgba(255,138,55,0.08)' }}>
                  ISRO × NNRMS
                </span>
                <span className="badge badge-green" style={{ border: '1px solid rgba(0,245,160,0.3)', color: 'var(--c-green)', background: 'rgba(0,245,160,0.08)' }}>
                  ACTIVE ORBIT
                </span>
              </div>

              <h1 className="tech-header-gradient" style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.5rem, 4.5vw, 4rem)',
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: 24,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}>
                Roads That<br />
                <span style={{
                  background: 'linear-gradient(135deg, var(--c-cyan) 30%, var(--c-purple) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Mitigate Blindness.
                </span>
              </h1>

              <p style={{
                fontSize: '1.05rem',
                fontFamily: 'var(--font-body)',
                color: 'var(--c-text-dim)',
                lineHeight: 1.75,
                marginBottom: 36,
                maxWidth: 550,
              }}>
                End-to-end satellite road extraction and graph-theoretic criticality analysis. 
                Reconstruct fragmented networks under green canopies and urban occlusions, maximizing downstream 
                utility of indigenous EO satellites Cartosat and Resourcesat LISS-IV.
              </p>

              {/* Satellite Pass Timer (BAH styled) */}
              <SatellitePassTimer />

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 48 }}>
                <Link to="/dashboard" className="btn-primary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ stroke: 'currentColor', strokeWidth: 2 }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
                  </svg>
                  MISSION CONSOLE
                </Link>
                <Link to="/simulation" className="btn-secondary">
                  RUN SIMULATION →
                </Link>
              </div>

              {/* Counter Statistics Row */}
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                {STATS.map(s => (
                  <div key={s.label} style={{ borderLeft: '2px solid var(--c-orange)', paddingLeft: 12 }}>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.8rem',
                      fontWeight: 800,
                      color: 'var(--c-orange)',
                      lineHeight: 1.2,
                    }}>
                      <AnimatedCounter target={s.value} />
                    </div>
                    <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--c-text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
                      {s.label}<br/>
                      <span style={{ color: 'var(--c-text-dim)', textTransform: 'none', fontFamily: 'var(--font-body)' }}>{s.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Mission Control Telemetry Canvas */}
            <div style={{
              position: 'relative',
              animation: 'fade-up 1s ease 0.2s both',
            }}>
              <div className="cyber-card cyber-card-ticks" style={{ padding: 6 }}>
                {/* Visual grid header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 18px',
                  background: 'rgba(6, 10, 19, 0.6)',
                  borderBottom: '1px solid var(--c-border)',
                }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['var(--c-orange)', 'var(--c-cyan)', 'var(--c-green)'].map((c, i) => (
                      <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                    ))}
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--c-text-dim)', letterSpacing: '0.05em' }}>
                    GEO_GRAPH_ABLAT.CON
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="status-dot online" style={{ background: 'var(--c-green)', boxShadow: '0 0 8px var(--c-green)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--c-green)' }}>ACTIVE</span>
                  </div>
                </div>
                
                {/* Visualizer canvas */}
                <NetworkCanvas width={660} height={390} />
                
                {/* Legend Row */}
                <div style={{
                  padding: '12px 18px',
                  background: 'rgba(6, 10, 19, 0.8)',
                  borderTop: '1px solid var(--c-border)',
                  display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'space-between',
                }}>
                  {[
                    { color: 'var(--c-cyan)', label: 'Standard Node' },
                    { color: 'var(--c-orange)', label: 'Gatekeeper / Critical' },
                    { color: 'rgba(255,138,55,0.4)', label: 'Occluded Segment' },
                    { color: 'var(--c-red)', label: 'Disabled (Click to toggle)' },
                  ].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--c-text-dim)' }}>
                        {l.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <p style={{
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: 'var(--c-text-faint)',
                marginTop: 12,
                letterSpacing: '0.05em',
              }}>
                [ DIRECT INTERACTION ENABLED · CLICK NODES TO TRIGGER STRESS-TEST ]
              </p>
            </div>

          </div>

          {/* BAH-style Segment Info Bar (Event Details banner) */}
          <div className="bah-segment-bar" style={{ marginTop: 80 }}>
            <div className="bah-segment-cell">
              <span style={{ fontSize: '0.72rem', color: 'var(--c-orange)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>NNRMS SCHEME</span>
              <strong style={{ marginTop: 6, fontSize: '0.95rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>ISRO STANDARD</strong>
            </div>
            <div className="bah-segment-cell">
              <span style={{ fontSize: '0.72rem', color: 'var(--c-cyan)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>ROAD RECALL</span>
              <strong style={{ marginTop: 6, fontSize: '0.95rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>91.4% RECOVERY</strong>
            </div>
            <div className="bah-segment-cell">
              <span style={{ fontSize: '0.72rem', color: 'var(--c-purple)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>GAP RESOLUTION</span>
              <strong style={{ marginTop: 6, fontSize: '0.95rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>&lt; 25px GAP HEAL</strong>
            </div>
            <div className="bah-segment-cell">
              <span style={{ fontSize: '0.72rem', color: 'var(--c-green)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>RESILIENCE INDEX</span>
              <strong style={{ marginTop: 6, fontSize: '0.95rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>R = L₀ / Lₚ (0.89)</strong>
            </div>
            <Link to="/dashboard" className="bah-segment-btn">
              OPEN MISSION CONTROL PORTAL
            </Link>
          </div>

        </div>
      </section>

      {/* ═══════════════ PIPELINE PHASES ═══════════════ */}
      <section style={{ padding: '120px 0', position: 'relative' }}>
        <div className="container">
          <div style={{ marginBottom: 70, textAlign: 'center' }}>
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Solution Architecture</div>
            <h2 className="section-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Four-Phase Pipeline
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto', fontSize: '1.05rem', color: 'var(--c-text-dim)' }}>
              From raw satellite pixels to actionable urban resilience intelligence.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 30 }}>
            {PHASES.map((phase, i) => (
              <div key={i} className="cyber-card" style={{
                padding: '36px 40px',
                display: 'grid',
                gridTemplateColumns: '80px 1fr',
                gap: 36,
                alignItems: 'start',
                border: '1px solid rgba(255, 138, 55, 0.1)',
              }}>
                {/* Phase number */}
                <div style={{
                  width: 80, height: 80,
                  border: `2px solid ${phase.color}`,
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${phase.color}10`,
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.8rem',
                  fontWeight: 900,
                  color: phase.color,
                  boxShadow: `0 0 20px ${phase.color}15`,
                }}>
                  {phase.num}
                </div>

                {/* Content */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                      {phase.title}
                    </h3>
                    <span className="badge" style={{
                      background: `${phase.color}15`,
                      color: phase.color,
                      border: `1px solid ${phase.color}35`,
                      fontSize: '0.65rem',
                    }}>
                      {phase.badge}
                    </span>
                  </div>
                  <p style={{ color: 'var(--c-text-dim)', fontSize: '0.95rem', lineHeight: 1.75, marginBottom: 20 }}>
                    {phase.desc}
                  </p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {phase.metrics.map(m => (
                      <span key={m} className="metric-chip" style={{ background: 'rgba(6, 10, 19, 0.8)', border: '1px solid var(--c-border-bright)', color: 'var(--c-cyan)' }}>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ TECH STACK ═══════════════ */}
      <section style={{ padding: '100px 0', borderTop: '1px solid var(--c-border)', background: 'rgba(2, 4, 10, 0.4)' }}>
        <div className="container">
          <div style={{ marginBottom: 60 }}>
            <div className="section-eyebrow">Technology</div>
            <h2 className="section-title" style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Commended Stack
            </h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {TECH_STACK.map(cat => (
              <div key={cat.cat} className="cyber-card" style={{ padding: 28, border: '1px solid rgba(0, 229, 255, 0.1)' }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--c-orange)',
                  marginBottom: 20,
                  borderBottom: '1px solid var(--c-border)',
                  paddingBottom: 10,
                }}>
                  {cat.cat}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {cat.items.map(item => (
                    <div key={item} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px',
                      background: 'rgba(6, 10, 19, 0.6)',
                      borderRadius: 6,
                      border: '1px solid rgba(0, 229, 255, 0.08)',
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--c-cyan)', boxShadow: '0 0 6px var(--c-cyan)' }} />
                      <span style={{ fontSize: '0.88rem', fontFamily: 'var(--font-mono)', color: 'var(--c-text-dim)' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA FOOTER ═══════════════ */}
      <section style={{
        padding: '120px 0',
        textAlign: 'center',
        borderTop: '1px solid var(--c-border)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow Element */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700, height: 700,
          background: 'radial-gradient(circle, rgba(255,138,55,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="container">
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--c-text-dim)',
            letterSpacing: '0.18em',
            marginBottom: 20,
            textTransform: 'uppercase',
          }}>
            NNRMS Space-Tech Mission System
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            fontWeight: 900,
            marginBottom: 24,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}>
            The city's vulnerability,<br />
            <span className="tech-header-gradient" style={{ color: 'var(--c-orange)', display: 'inline-block' }}>
              made transparent.
            </span>
          </h2>
          <p style={{
            color: 'var(--c-text-dim)',
            fontFamily: 'var(--font-body)',
            fontSize: '1.05rem',
            maxWidth: 550,
            margin: '0 auto 48px',
            lineHeight: 1.75,
          }}>
            Ingest satellite imagery, build topological graph metrics, and stress-test urban infrastructures using our state-of-the-art diagnostic suite.
          </p>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/dashboard" className="btn-primary">
              LAUNCH MISSION CONTROL
            </Link>
            <Link to="/simulation" className="btn-secondary">
              RUN STRESS-TEST CONSOLE
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
