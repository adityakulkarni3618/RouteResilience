import React from 'react';
import { Link } from 'react-router-dom';

const USE_CASES = [
  {
    icon: "🚑",
    color: "var(--c-green)",
    title: "Emergency Medical Services",
    desc: "When primary routes are blocked, RouteResilience instantly identifies alternate paths for ambulances, reducing response time in critical situations.",
    metric: "4.2 min avg saved per incident",
    tags: ["EMS", "Routing", "Real-time"]
  },
  {
    icon: "🏙️",
    color: "var(--c-cyan)",
    title: "Smart Urban Planning",
    desc: "City planners use betweenness centrality maps to prioritize which roads to upgrade or duplicate before approving new developments.",
    metric: "143 bottlenecks identified per city",
    tags: ["Planning", "GIS", "Investment"]
  },
  {
    icon: "🌊",
    color: "var(--c-orange)",
    title: "Monsoon Flood Preparedness",
    desc: "Pre-monsoon simulation identifies which road corridors will be cut off under heavy rainfall, enabling advance deployment of resources.",
    metric: "8 high-risk corridors flagged",
    tags: ["Flood", "Monsoon", "Prevention"]
  },
  {
    icon: "🚒",
    color: "var(--c-amber)",
    title: "Fire & Disaster Response",
    desc: "Fire departments simulate blocked-road scenarios and pre-plan alternate routes to every city zone before emergencies occur.",
    metric: "100% zone coverage maintained",
    tags: ["Fire", "Disaster", "Preparedness"]
  },
  {
    icon: "🚦",
    color: "var(--c-green)",
    title: "Smart Traffic Management",
    desc: "Identify network chokepoints and simulate the impact of smart signal optimization and temporary road closures on overall mobility.",
    metric: "23% congestion reduction estimated",
    tags: ["Traffic", "Signals", "Optimization"]
  },
  {
    icon: "🏗️",
    color: "var(--c-cyan)",
    title: "Infrastructure ROI Analysis",
    desc: "Quantify the resilience impact of proposed infrastructure projects before spending — which new road or bridge improves the resilience index most?",
    metric: "R index improvement quantified",
    tags: ["Investment", "ROI", "Planning"]
  }
];

export default function UseCasePage() {
  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', color: '#ffffff' }}>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            SMART CITY APPLICATIONS
          </div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Real-World Use Cases
          </h1>
          <p style={{ color: 'var(--c-text-dim)', maxWidth: 680, margin: '0 auto', lineHeight: 1.7, fontSize: '1.1rem' }}>
            RouteResilience solves critical infrastructure challenges across public services, emergency management, and urban planning.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
          marginBottom: 56
        }}>
          {USE_CASES.map((uc, i) => (
            <div
              key={i}
              className="glass-panel use-case-card"
              style={{
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease',
                cursor: 'default',
                height: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{uc.icon}</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: 12 }}>
                  {uc.title}
                </h3>
                <p style={{ color: 'var(--c-text-dim)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 20 }}>
                  {uc.desc}
                </p>
              </div>
              
              <div>
                <div style={{
                  fontWeight: 'bold',
                  color: uc.color,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.92rem',
                  marginBottom: 16
                }}>
                  {uc.metric}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {uc.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        background: uc.color + '20',
                        border: '1px solid ' + uc.color + '40',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: '0.7rem',
                        color: uc.color,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="glass-panel" style={{ padding: 48, textAlign: 'center', background: 'rgba(13, 22, 48, 0.4)' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>
            Ready to make your city smarter?
          </h2>
          <p style={{ color: 'var(--c-text-dim)', maxWidth: 580, margin: '0 auto 28px', lineHeight: 1.6 }}>
            Start with your city — enter any coordinates and get a full road network resilience analysis in under 60 seconds.
          </p>
          <Link to="/simulation" className="btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            Analyze Your City
          </Link>
        </div>

      </div>
    </div>
  );
}
