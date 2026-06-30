import React, { useState } from 'react';
import { getShiftedNodes, getActiveLocation } from '../utils/locationHelper';
import { API_URL } from '../config';

const CITY_NODES_BASE = [
  { id: 0, name: 'Silk Board Junction',  bc: 0.91, degree: 12, affected: 125000 },
  { id: 1, name: 'KR Puram Bridge',      bc: 0.84, degree: 10, affected: 98000  },
  { id: 2, name: 'Hebbal Flyover',       bc: 0.79, degree: 9,  affected: 87000  },
  { id: 3, name: 'Marathahalli Jn.',     bc: 0.73, degree: 8,  affected: 72000  },
  { id: 4, name: 'Electronic City Toll', bc: 0.67, degree: 7,  affected: 61000  },
  { id: 5, name: 'Bannerghatta Road',    bc: 0.61, degree: 7,  affected: 54000  },
  { id: 6, name: 'Whitefield Hub',       bc: 0.55, degree: 6,  affected: 43000  },
  { id: 7, name: 'Yelahanka',            bc: 0.48, degree: 5,  affected: 31000  },
];

export default function CascadeSimulator() {
  const activeLoc = getActiveLocation();
  const CITY_NODES = getShiftedNodes(CITY_NODES_BASE);

  const [triggerNodeId, setTriggerNodeId] = useState(0);
  const [maxDepth, setMaxDepth] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [visibleCount, setVisibleCount] = useState(0);

  const handleSimulate = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setVisibleCount(0);

    try {
      const response = await fetch(`${API_URL}/api/simulate/cascade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trigger_node_id: parseInt(triggerNodeId),
          max_cascade_depth: parseInt(maxDepth),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);

      // Stagger the animation of results
      if (data.failures && data.failures.length > 0) {
        data.failures.forEach((_, idx) => {
          setTimeout(() => {
            setVisibleCount(prev => prev + 1);
          }, idx * 600);
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to run cascade failure simulation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', color: 'var(--c-text)' }}>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80, maxWidth: 800 }}>
        
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div className="section-eyebrow">Cascade Simulator</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Iterative Cascade Collapse
          </h1>
          <p style={{ color: 'var(--c-text-dim)', fontSize: '1rem' }}>
            Simulate how localized node failures propagate through the {activeLoc.name.split(',')[0]} road network. Nodes fail if their betweenness exceeds the dropping threshold at each depth.
          </p>
        </div>

        {/* Configuration Panel */}
        <div className="glass-panel" style={{ padding: 24, marginBottom: 32 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 16, fontFamily: 'var(--font-display)' }}>
            Configure Simulation Parameters
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--c-text-dim)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
                TRIGGER NODE
              </label>
              <select
                value={triggerNodeId}
                onChange={(e) => setTriggerNodeId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(8, 15, 30, 0.8)',
                  border: '1px solid var(--c-border-bright)',
                  borderRadius: 8,
                  color: 'var(--c-text)',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                }}
              >
                {CITY_NODES.map((node) => (
                  <option key={node.id} value={node.id} style={{ background: 'var(--c-panel)' }}>
                    {node.name} (BC: {node.bc.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--c-text-dim)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
                MAX CASCADE DEPTH
              </label>
              <select
                value={maxDepth}
                onChange={(e) => setMaxDepth(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(8, 15, 30, 0.8)',
                  border: '1px solid var(--c-border-bright)',
                  borderRadius: 8,
                  color: 'var(--c-text)',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                }}
              >
                {[3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
                  <option key={d} value={d} style={{ background: 'var(--c-panel)' }}>
                    {d} steps
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
          >
            {loading ? '⟳ Propagating Cascade...' : '⚡ Trigger Cascade'}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="glass-panel" style={{ padding: 16, borderColor: 'var(--c-red)', color: 'var(--c-red)', marginBottom: 32, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            ⚠ ERROR: {error}
          </div>
        )}

        {/* Results Panel */}
        {results && (
          <div>
            {/* Header info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--c-cyan)' }}>
                {results.total_cascade_failures} nodes failed in cascade
              </div>
              <span className="badge badge-red" style={{ animation: 'pulse-dot 2s infinite' }}>
                CRITICAL COLLAPSE
              </span>
            </div>

            {/* Cascade stopped early banner */}
            {results.cascade_stopped_early && (
              <div 
                className="glass-panel" 
                style={{ 
                  padding: '14px 20px', 
                  borderColor: 'var(--c-green)', 
                  background: 'rgba(16, 185, 129, 0.08)',
                  color: 'var(--c-green)', 
                  borderRadius: 8,
                  marginBottom: 24,
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <span>✓</span>
                <span>Cascade propagation stopped early. The network stabilized after Step {results.failures[results.failures.length - 1]?.step}.</span>
              </div>
            )}

            {/* Vertical timeline */}
            <div style={{ position: 'relative', paddingLeft: 24, borderLeft: '2px solid var(--c-border-bright)' }}>
              {results.failures.map((failure, idx) => {
                const isVisible = idx < visibleCount;
                return (
                  <div
                    key={idx}
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
                      transition: 'opacity 0.5s ease, transform 0.5s ease',
                      position: 'relative',
                      marginBottom: 24,
                    }}
                  >
                    {/* Circle Dot indicator */}
                    <div
                      style={{
                        position: 'absolute',
                        left: -33,
                        top: 12,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: failure.step === 0 ? 'var(--c-red)' : 'var(--c-amber)',
                        border: '4px solid var(--c-void)',
                        boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
                      }}
                    />

                    {/* Timeline card */}
                    <div className="glass-panel" style={{ padding: 18, background: 'rgba(17, 24, 39, 0.85)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--c-text-faint)', marginRight: 8, textTransform: 'uppercase', border: '1px solid var(--c-border)', padding: '2px 6px', borderRadius: 4 }}>
                            STEP {failure.step}
                          </span>
                          <span style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--c-text)' }}>
                            {CITY_NODES[failure.node_id]?.name || failure.node_name}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: 'var(--c-red)', fontSize: '1rem', fontWeight: 'bold' }}>💀 ⚠</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--c-amber)' }}>
                            BC: {failure.betweenness.toFixed(3)}
                          </span>
                        </div>
                      </div>
                      <div style={{ color: 'var(--c-text-dim)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', lineHeight: 1.4 }}>
                        {failure.reason}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
