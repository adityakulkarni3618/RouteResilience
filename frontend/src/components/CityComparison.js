import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CITIES, getActiveLocation } from '../utils/locationHelper';

// MOCK_METRICS helper mapping
const MOCK_METRICS = {
  bengaluru: { shortName: 'Bengaluru', R: 0.891, criticalNodes: 143, healing: '85.2%', grade: 'A' },
  new_york: { shortName: 'NYC', R: 0.847, criticalNodes: 185, healing: '78.4%', grade: 'B' },
  london: { shortName: 'London', R: 0.923, criticalNodes: 120, healing: '91.6%', grade: 'A' },
  paris: { shortName: 'Paris', R: 0.876, criticalNodes: 150, healing: '88.1%', grade: 'A' },
  tokyo: { shortName: 'Tokyo', R: 0.934, criticalNodes: 198, healing: '94.5%', grade: 'A' }
};

const getZoneColor = (r) => {
  if (r >= 0.85) return 'var(--c-green)';
  if (r >= 0.70) return 'var(--c-amber)';
  return 'var(--c-red)';
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div style={{ background: 'rgba(13,22,48,0.95)', border: '1px solid var(--c-border-bright)', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
      <div style={{ color: 'var(--c-text)', fontWeight: 'bold', marginBottom: 6 }}>{data.name}</div>
      <div style={{ color: getZoneColor(data.R), marginBottom: 2 }}>
        Resilience Index: <strong>{data.R.toFixed(3)}</strong>
      </div>
      <div style={{ color: 'var(--c-text-dim)', marginBottom: 2 }}>Critical Nodes: {data.criticalNodes}</div>
      <div style={{ color: 'var(--c-text-dim)' }}>Healing Efficiency: {data.healing}</div>
    </div>
  );
};

export default function CityComparison() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const activeLoc = getActiveLocation();

  const DATA = React.useMemo(() => {
    const list = [...CITIES];
    const isDefault = CITIES.some(c => c.key === activeLoc?.key);
    if (!isDefault && activeLoc) {
      list.push({
        ...activeLoc,
        key: activeLoc.key || 'custom',
        name: activeLoc.name || 'Custom Region'
      });
    }

    return list.map(city => {
      const metric = MOCK_METRICS[city.key] || {
        shortName: city.name.split(',')[0],
        R: 0.820,
        criticalNodes: 112,
        healing: '82.5%',
        grade: 'B'
      };
      return {
        name: city.name,
        shortName: metric.shortName,
        R: metric.R,
        criticalNodes: metric.criticalNodes,
        healing: metric.healing,
        grade: metric.grade
      };
    });
  }, [activeLoc]);

  if (!loaded) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '120px 48px', maxWidth: '1000px', margin: '0 auto', minHeight: '80vh', justifyContent: 'center' }}>
        <div style={{ height: '40px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', animation: 'pulse-dot 1.5s infinite alternate' }} />
        <div style={{ height: '120px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', animation: 'pulse-dot 1.5s infinite alternate' }} />
        <div style={{ height: '220px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', animation: 'pulse-dot 1.5s infinite alternate' }} />
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div className="glass-panel" style={{ padding: 36, background: 'rgba(13, 22, 48, 0.65)', border: '1px solid var(--c-border-bright)', borderRadius: 12 }}>
          
          {/* Title & Eyebrow */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 32 }}>
            <div>
              <div className="section-eyebrow">Multi-City Intelligence</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--c-text)', marginTop: 4 }}>
                Smart City Readiness Index
              </h2>
              <p style={{ color: 'var(--c-text-dim)', fontSize: '0.85rem', marginTop: 6 }}>
                Compare infrastructure resilience across cities to benchmark smart city readiness and prioritize improvement investments.
              </p>
            </div>

            {/* CTA Button */}
            <Link
              to="/simulation"
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(255, 138, 55, 0.2)',
                transition: 'all 0.2s'
              }}
            >
              Compare My City ❯
            </Link>
          </div>

          {/* Chart Section */}
          <div style={{ width: '100%', height: 260, marginBottom: 36, background: 'rgba(2, 4, 10, 0.4)', borderRadius: 8, padding: 16, border: '1px solid var(--c-border)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="shortName"
                  stroke="var(--c-text-faint)"
                  fontSize={11}
                  fontFamily="var(--font-mono)"
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 1.0]}
                  ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
                  stroke="var(--c-text-faint)"
                  fontSize={11}
                  fontFamily="var(--font-mono)"
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="R" radius={[4, 4, 0, 0]} maxBarSize={45}>
                  {DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getZoneColor(entry.R)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table Section */}
          <div style={{ overflowX: 'auto', border: '1px solid var(--c-border)', borderRadius: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
              <thead>
                <tr style={{ background: 'rgba(56, 189, 248, 0.04)' }}>
                  <th style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--c-text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 20px', borderBottom: '1px solid var(--c-border)' }}>City</th>
                  <th style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--c-text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 20px', borderBottom: '1px solid var(--c-border)' }}>R Index</th>
                  <th style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--c-text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 20px', borderBottom: '1px solid var(--c-border)' }}>Critical Nodes</th>
                  <th style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--c-text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 20px', borderBottom: '1px solid var(--c-border)' }}>Healing %</th>
                  <th style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--c-text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 20px', borderBottom: '1px solid var(--c-border)' }}>Grade</th>
                </tr>
              </thead>
              <tbody>
                {DATA.map((row, idx) => {
                  const color = getZoneColor(row.R);
                  return (
                    <tr
                      key={row.shortName}
                      style={{
                        background: idx % 2 === 1 ? 'rgba(255,255,255,0.01)' : 'transparent',
                        borderBottom: idx === DATA.length - 1 ? 'none' : '1px solid var(--c-border)',
                        transition: 'background 0.2s'
                      }}
                      className="table-row-hover"
                    >
                      <td style={{ padding: '16px 20px', fontSize: '0.85rem', color: 'var(--c-text)', fontWeight: 600 }}>{row.name}</td>
                      <td style={{ padding: '16px 20px', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: color, fontWeight: 700 }}>{row.R.toFixed(3)}</td>
                      <td style={{ padding: '16px 20px', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--c-text-dim)' }}>{row.criticalNodes}</td>
                      <td style={{ padding: '16px 20px', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--c-text-dim)' }}>{row.healing}</td>
                      <td style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 800 }}>
                        <span style={{ color: color, padding: '3px 8px', borderRadius: 4, background: `${color}15`, border: `1px solid ${color}33`, fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                          {row.grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
