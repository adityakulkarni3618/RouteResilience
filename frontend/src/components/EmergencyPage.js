import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EmergencyPage() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const kpiData = [
    { label: "Active Road Nodes", value: "12,847", color: "var(--c-green)" },
    { label: "Network Resilience", value: "R=0.891", color: "var(--c-cyan)" },
    { label: "Critical Nodes", value: "143", color: "var(--c-orange)" },
    { label: "Alternate Routes Ready", value: "28", color: "var(--c-green)" }
  ];

  const presets = [
    { label: "Flash Flood", icon: "🌊", hash: "flood", hoverColor: "rgba(239, 68, 68, 0.4)" },
    { label: "Seismic Event", icon: "🏚️", hash: "earthquake", hoverColor: "rgba(245, 158, 11, 0.4)" },
    { label: "Bridge Closure", icon: "🌉", hash: "collapse", hoverColor: "rgba(234, 179, 8, 0.4)" },
    { label: "Mass Evacuation", icon: "🚶", hash: "evacuation", hoverColor: "rgba(6, 182, 212, 0.4)" }
  ];

  const routes = [
    { route: "EMS-01", from: "Victoria Hospital", to: "Silk Board", dist: "8.2 km", time: "18 min", status: "Clear", statusColor: "var(--c-green)" },
    { route: "EMS-02", from: "Fire Station HSR", to: "Marathahalli", dist: "5.7 km", time: "12 min", status: "Clear", statusColor: "var(--c-green)" },
    { route: "EMS-03", from: "NIMHANS", to: "Hebbal", dist: "14.1 km", time: "31 min", status: "Monitor", statusColor: "var(--c-orange)" },
    { route: "EMS-04", from: "Bowring Hospital", to: "KR Puram", dist: "9.4 km", time: "22 min", status: "Clear", statusColor: "var(--c-green)" }
  ];

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', color: '#ffffff' }}>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="section-eyebrow">
              <span className="status-dot" style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 10px #ef4444',
                animation: 'pulse-dot 1s infinite alternate'
              }} />
              <span style={{ color: '#ef4444', fontWeight: 800 }}>EMERGENCY COMMAND CENTER</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: 8 }}>
              City Emergency Response Dashboard
            </h1>
            <p style={{ color: 'var(--c-text-dim)', fontSize: '1rem', marginTop: 4 }}>
              Real-time road network status for emergency coordinators and first responders
            </p>
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--c-text-faint)',
            background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239,68,68,0.2)',
            padding: '12px 18px', borderRadius: 8
          }}>
            SYSTEM TIME: {time.toLocaleTimeString()}
          </div>
        </div>

        {/* Section 1 — Alert Status Bar */}
        <div className="glass-panel" style={{
          padding: '18px 24px',
          marginBottom: 32,
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
            <span>🟡</span>
            <span style={{ color: 'var(--c-text-dim)' }}>
              <strong>WATCH:</strong> Silk Board Junction — High betweenness load detected
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
            <span>🟢</span>
            <span style={{ color: 'var(--c-text-dim)' }}>
              <strong>CLEAR:</strong> NH-44 Corridor — All lanes operational
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
            <span>🔴</span>
            <span style={{ color: 'var(--c-text-dim)' }}>
              <strong>ALERT:</strong> KR Puram Bridge — Reduced capacity, monitor closely
            </span>
          </div>
        </div>

        {/* Section 2 — KPI Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20,
          marginBottom: 40
        }}>
          {kpiData.map((kpi, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: 20, borderLeft: `3px solid ${kpi.color}` }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--c-text-faint)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: kpi.color, marginTop: 8 }}>
                {kpi.value}
              </div>
            </div>
          ))}
        </div>

        {/* Section 3 — Quick Scenario Launcher */}
        <div className="glass-panel" style={{ padding: 24, marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 16 }}>
            Launch Emergency Simulation
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 20
          }}>
            {presets.map((p, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/simulation#sim/sc=${p.hash}`)}
                style={{
                  padding: 20,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--c-border)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = p.hoverColor.replace('0.4', '0.8');
                  e.currentTarget.style.background = p.hoverColor;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--c-border)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>{p.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4 — Pre-planned Routes */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 16 }}>
            Pre-Computed Emergency Routes
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ margin: 0, width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ color: 'var(--c-text-faint)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>Route</th>
                  <th style={{ color: 'var(--c-text-faint)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>From</th>
                  <th style={{ color: 'var(--c-text-faint)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>To</th>
                  <th style={{ color: 'var(--c-text-faint)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>Distance</th>
                  <th style={{ color: 'var(--c-text-faint)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>Est. Time</th>
                  <th style={{ color: 'var(--c-text-faint)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((r, idx) => (
                  <tr key={idx} style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
                    <td style={{ fontWeight: 700, color: 'var(--c-cyan)' }}>{r.route}</td>
                    <td>{r.from}</td>
                    <td>{r.to}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{r.dist}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{r.time}</td>
                    <td>
                      <span style={{
                        color: r.statusColor,
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: r.statusColor + '20',
                        border: '1px solid ' + r.statusColor + '40',
                        fontSize: '0.78rem',
                        fontWeight: 600
                      }}>
                        {r.status === 'Clear' ? '✅ Clear' : '⚠️ Monitor'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
