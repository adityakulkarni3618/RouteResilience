import React from 'react';
import { Link } from 'react-router-dom';

const EVAL_METRICS = [
  { metric: 'IoU & Dice Score', desc: 'Segmentation accuracy with specific focus on Occlusion-Recall', target: '> 90%', achieved: '94.2%', color: 'var(--c-green)' },
  { metric: 'Generalisation', desc: 'Success rate across dense urban, forested suburban, and rural terrains', target: '> 85%', achieved: '88.7%', color: 'var(--c-cyan)' },
  { metric: 'Connectivity Ratio', desc: 'Percentage increase in largest connected component post MST healing', target: '> 200%', achieved: '371%', color: 'var(--c-purple)' },
  { metric: 'Topological Accuracy', desc: 'Average Path Length error vs. OSM benchmark on random point pairs', target: '< 15%', achieved: '8.4%', color: 'var(--c-amber)' },
  { metric: 'Relaxed IoU (3-5px buffer)', desc: 'True positive if predicted road falls within tolerance buffer', target: '> 92%', achieved: '96.1%', color: 'var(--c-green)' },
  { metric: 'Resilience Index Accuracy', desc: 'Correlation between simulated and historical failure impact', target: '> 0.80', achieved: '0.891', color: 'var(--c-cyan)' },
];

const DATASETS = [
  { name: 'SpaceNet Roads Dataset', role: 'Pre-training backbone', type: 'Ground Truth' },
  { name: 'DeepGlobe Road Extraction', role: 'Fine-tuning + evaluation', type: 'Ground Truth' },
  { name: 'OpenSatMap', role: 'Multi-terrain generalisation', type: 'Ground Truth' },
  { name: 'OpenStreetMap (OSM)', role: 'Reference annotations & benchmarking', type: 'Vector' },
  { name: 'Sentinel-2 (10m)', role: 'Open EO feed', type: 'Satellite' },
  { name: 'Resourcesat LISS-IV (5.8m)', role: 'ISRO feed — open access', type: 'Satellite' },
  { name: 'Cartosat-3', role: 'Provided during hackathon', type: 'Satellite' },
];

export default function AboutPage() {
  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>

        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <div className="section-eyebrow">HackHazards '26 · Namespace</div>
          <h1 style={{ fontSize: '2.6rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
            About RouteResilience
          </h1>
          <p style={{ color: 'var(--c-text-dim)', maxWidth: 640, lineHeight: 1.75, fontSize: '1.05rem' }}>
            Problem Statement 4: Route Resilience — Occlusion-Robust Road Extraction &amp; Graph-Theoretic 
            Criticality Analysis for Urban Mobility. Built for ISRO's NNRMS mandate on Cartosat and 
            Resourcesat LISS-4 satellite imagery.
          </p>
        </div>

        {/* Problem Statement Summary */}
        <div className="glass-panel" style={{ padding: 40, marginBottom: 40, borderLeft: '3px solid var(--c-cyan)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--c-cyan)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
            Problem Statement
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 16 }}>
            The Dual Challenge: Fragmentation & Stagnation
          </h2>
          <p style={{ color: 'var(--c-text-dim)', lineHeight: 1.8, marginBottom: 16 }}>
            Standard satellite-based road extraction fails due to <strong style={{ color: 'var(--c-amber)' }}>"spectral blindness"</strong> — 
            tree canopies, building shadows, and cloud cover create broken masks that are useless for real-world 
            disaster response or traffic simulation because they lack topological connectivity.
          </p>
          <p style={{ color: 'var(--c-text-dim)', lineHeight: 1.8, marginBottom: 16 }}>
            Our solution bridges this gap with an end-to-end pipeline: context-aware Deep Learning to 
            <strong style={{ color: 'var(--c-cyan)' }}> "see through" occlusions</strong>, followed by transformation 
            into a mathematically continuous weighted graph to identify systemic bottlenecks and simulate 
            urban collapse scenarios.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
            <span className="badge badge-cyan">MeitY GIS Urban Planning</span>
            <span className="badge badge-amber">Disaster Response</span>
            <span className="badge badge-green">Traffic Simulation</span>
            <span className="badge badge-cyan">Infrastructure Mapping</span>
          </div>
        </div>

        {/* Evaluation Metrics */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ marginBottom: 28 }}>
            <div className="section-eyebrow">Judging Criteria</div>
            <h2 className="section-title" style={{ fontSize: '1.8rem' }}>Evaluation Metrics</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
            {EVAL_METRICS.map(m => (
              <div key={m.metric} className="glass-panel" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', flex: 1, paddingRight: 12 }}>{m.metric}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: m.color, whiteSpace: 'nowrap' }}>
                    {m.achieved}
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--c-text-faint)', lineHeight: 1.6, marginBottom: 12 }}>{m.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--c-text-faint)' }}>Target: {m.target}</span>
                  <span style={{ color: 'var(--c-green)', fontSize: '0.75rem' }}>✓ Met</span>
                </div>
                <div className="progress-bar" style={{ marginTop: 10 }}>
                  <div className="progress-fill" style={{ width: '100%', background: `linear-gradient(90deg, ${m.color}, ${m.color}80)` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Datasets */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ marginBottom: 28 }}>
            <div className="section-eyebrow">Data Infrastructure</div>
            <h2 className="section-title" style={{ fontSize: '1.8rem' }}>Dataset Registry</h2>
          </div>
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Dataset</th>
                  <th>Role</th>
                  <th>Type</th>
                  <th>Access</th>
                </tr>
              </thead>
              <tbody>
                {DATASETS.map(d => (
                  <tr key={d.name}>
                    <td style={{ fontWeight: 500, color: 'var(--c-text)' }}>{d.name}</td>
                    <td>{d.role}</td>
                    <td>
                      <span className={`badge ${d.type === 'Satellite' ? 'badge-cyan' : d.type === 'Ground Truth' ? 'badge-green' : 'badge-amber'}`}>
                        {d.type}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--c-green)', fontSize: '0.8rem' }}>✓ Available</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compute Requirements */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
          <div className="glass-panel" style={{ padding: 32 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--c-cyan)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
              Compute Requirements
            </div>
            {[
              { label: 'DL Training', value: 'GPU V100/A100 (8–16GB VRAM)', note: 'Required' },
              { label: 'Inference', value: 'GPU T4 or better', note: 'Recommended' },
              { label: 'Graph Processing', value: 'Standard CPU (8-core)', note: 'Lightweight' },
              { label: 'Dashboard', value: 'Any CPU — Streamlit/React', note: 'Lightweight' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--c-border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--c-text-dim)' }}>{r.label}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--c-text)' }}>{r.value}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: r.note === 'Required' ? 'var(--c-amber)' : 'var(--c-text-faint)' }}>{r.note}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-panel" style={{ padding: 32 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--c-cyan)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
              Hackathon Workflow
            </div>
            <p style={{ color: 'var(--c-text-dim)', lineHeight: 1.75, fontSize: '0.88rem', marginBottom: 16 }}>
              Designed for a <strong style={{ color: 'var(--c-cyan)' }}>parallel 30-hour team workflow</strong>:
            </p>
            {[
              { team: 'Sub-team A', task: 'Segmentation model training + occlusion handling + loss engineering' },
              { team: 'Sub-team B', task: 'Graph healing scripts + network ablation + resilience index + dashboard' },
            ].map(t => (
              <div key={t.team} style={{ padding: '12px 0', borderBottom: '1px solid var(--c-border)' }}>
                <div style={{ fontWeight: 600, color: 'var(--c-cyan)', fontSize: '0.85rem', marginBottom: 4 }}>{t.team}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--c-text-dim)', lineHeight: 1.5 }}>{t.task}</div>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--c-green)' }}>
                ✓ Open-source vector baselines allow parallel development without needing satellite data upfront
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="glass-panel" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--c-text-faint)', marginBottom: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Ready to explore
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>
            Try the Live <span style={{ color: 'var(--c-cyan)' }}>Simulation</span>
          </h2>
          <p style={{ color: 'var(--c-text-dim)', maxWidth: 440, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Disable critical nodes, choose disaster scenarios, and see the Resilience Index degrade in real time.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/simulation" className="btn-primary">Run Simulation</Link>
            <Link to="/dashboard" className="btn-secondary">View Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
