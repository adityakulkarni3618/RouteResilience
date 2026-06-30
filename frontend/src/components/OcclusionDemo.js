import React, { useState, useEffect, useRef } from 'react';

/**
 * OcclusionDemo - Premium interactive satellite occlusion & graph recovery visualization.
 */
// Dynamic canopy circle configurations
const baseCanopies = [
  { cx: 80, cy: 80, rx: 25, ry: 20, rot: 30 },
  { cx: 150, cy: 150, rx: 35, ry: 30, rot: -15 },
  { cx: 210, cy: 90, rx: 28, ry: 22, rot: 45 },
  { cx: 220, cy: 210, rx: 32, ry: 25, rot: 10 },
  { cx: 90, cy: 200, rx: 30, ry: 24, rot: -35 },
  { cx: 260, cy: 140, rx: 24, ry: 18, rot: 15 }
];

export default function OcclusionDemo() {
  const [coverage, setCoverage] = useState(30); // 10% to 60%
  const canvasLeftRef = useRef(null);
  const canvasRightRef = useRef(null);

  useEffect(() => {
    const canvasLeft = canvasLeftRef.current;
    const canvasRight = canvasRightRef.current;
    if (!canvasLeft || !canvasRight) return;

    const ctxL = canvasLeft.getContext('2d');
    const ctxR = canvasRight.getContext('2d');
    if (!ctxL || !ctxR) return;

    // Define road paths
    const drawRoadPaths = (ctx, width, color, dash = []) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash(dash);

      // Road 1 (Diagonal 1)
      ctx.beginPath();
      ctx.moveTo(20, 20);
      ctx.lineTo(280, 280);
      ctx.stroke();

      // Road 2 (Diagonal 2)
      ctx.beginPath();
      ctx.moveTo(20, 280);
      ctx.lineTo(280, 20);
      ctx.stroke();

      // Road 3 (Horizontal mid)
      ctx.beginPath();
      ctx.moveTo(10, 150);
      ctx.lineTo(290, 150);
      ctx.stroke();
    };

    // Draw canopy shapes (irregular ellipses)
    const drawCanopyShapes = (ctx, coverageFactor, fillColor, strokeColor, strokeDash = []) => {
      baseCanopies.forEach(c => {
        // Radii scale dynamically with coverage slider
        const scale = coverageFactor / 30.0;
        const rx = c.rx * scale;
        const ry = c.ry * scale;

        ctx.save();
        ctx.translate(c.cx, c.cy);
        ctx.rotate((c.rot * Math.PI) / 180);
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, 2 * Math.PI);
        
        if (fillColor) {
          ctx.fillStyle = fillColor;
          ctx.fill();
        }
        if (strokeColor) {
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 1.5;
          ctx.setLineDash(strokeDash);
          ctx.stroke();
        }
        ctx.restore();
      });
    };

    // Helper to draw building shadows / urban structures
    const drawUrbanScene = (ctx) => {
      ctx.fillStyle = '#111424'; // base ground
      ctx.fillRect(0, 0, 300, 300);

      // Draw synthetic block buildings
      ctx.fillStyle = '#1a1a2e'; // dark shadows / buildings
      const buildings = [
        { x: 35, y: 85, w: 40, h: 50 },
        { x: 105, y: 25, w: 55, h: 40 },
        { x: 195, y: 35, w: 45, h: 55 },
        { x: 235, y: 105, w: 40, h: 45 },
        { x: 175, y: 225, w: 50, h: 50 },
        { x: 95, y: 235, w: 60, h: 40 },
        { x: 25, y: 185, w: 45, h: 55 }
      ];
      buildings.forEach(b => {
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x, b.y, b.w, b.h);
      });
    };

    // Calculate percent of hidden road pixels (proxy based on coverage)
    const hiddenPct = Math.round(coverage * 1.03);

    // ==========================================
    // DRAW LEFT CANVAS (OCCLUDED SATELLITE)
    // ==========================================
    ctxL.clearRect(0, 0, 300, 300);
    drawUrbanScene(ctxL);

    // 1. Draw base visible road in light gray
    drawRoadPaths(ctxL, 6, '#4b5563'); // background road line
    drawRoadPaths(ctxL, 4, '#8a8a9a'); // visible asphalt

    // 2. Setup clipping mask inside canopy to draw red dashed hidden outlines
    ctxL.save();
    // Build clip path of all canopy circles
    ctxL.beginPath();
    baseCanopies.forEach(c => {
      const scale = coverage / 30.0;
      ctxL.ellipse(c.cx, c.cy, c.rx * scale, c.ry * scale, (c.rot * Math.PI) / 180, 0, 2 * Math.PI);
    });
    ctxL.clip();
    // Draw red dashed hidden roads inside clip
    drawRoadPaths(ctxL, 4, '#ef4444', [4, 4]);
    ctxL.restore();

    // 3. Draw opaque green canopy shapes over hidden roads
    drawCanopyShapes(ctxL, coverage, 'rgba(16, 85, 30, 0.95)', '#22c55e');

    // 4. Footer & Text
    ctxL.fillStyle = 'rgba(2, 4, 10, 0.85)';
    ctxL.fillRect(0, 265, 300, 35);
    ctxL.fillStyle = '#f59e0b'; // Yellow
    ctxL.font = 'bold 10px var(--font-mono)';
    ctxL.textAlign = 'center';
    ctxL.fillText(`OCCLUDED — ${hiddenPct}% road pixels hidden`, 150, 286);


    // ==========================================
    // DRAW RIGHT CANVAS (MODEL PREDICTION RECOVERED)
    // ==========================================
    ctxR.clearRect(0, 0, 300, 300);
    drawUrbanScene(ctxR);

    // 1. Draw base unoccluded road in light gray
    drawRoadPaths(ctxR, 6, '#4b5563');
    drawRoadPaths(ctxR, 4, '#8a8a9a');

    // 2. Setup clipping mask to draw bright cyan recovered roads
    ctxR.save();
    ctxR.beginPath();
    baseCanopies.forEach(c => {
      const scale = coverage / 30.0;
      ctxR.ellipse(c.cx, c.cy, c.rx * scale, c.ry * scale, (c.rot * Math.PI) / 180, 0, 2 * Math.PI);
    });
    ctxR.clip();
    // Draw cyan recovered roads inside clip
    drawRoadPaths(ctxR, 4, '#00e5ff');
    ctxR.restore();

    // 3. Draw semi-transparent green canopy overlays (inferred through)
    drawCanopyShapes(ctxR, coverage, 'rgba(34, 197, 94, 0.15)', 'rgba(34, 197, 94, 0.5)', [4, 4]);

    // Draw label "INFERRED" in middle of largest canopy circle
    ctxR.fillStyle = 'rgba(34, 197, 94, 0.85)';
    ctxR.font = '8px var(--font-mono)';
    ctxR.textAlign = 'center';
    ctxR.fillText('INFERRED THROUGH', 150, 153);

    // 4. Footer & Text
    ctxR.fillStyle = 'rgba(2, 4, 10, 0.85)';
    ctxR.fillRect(0, 265, 300, 35);
    ctxR.fillStyle = '#10b981'; // Green
    ctxR.font = 'bold 10px var(--font-mono)';
    ctxR.textAlign = 'center';
    ctxR.fillText(`RECOVERED — IoU: 91.4% | Recall: 94.2%`, 150, 286);

  }, [coverage]);

  return (
    <div className="glass-panel" style={{ padding: 36, background: 'rgba(13, 22, 48, 0.65)', border: '1px solid var(--c-border-bright)', borderRadius: 12 }}>
      
      {/* Title & Section Eyebrow */}
      <div style={{ marginBottom: 28 }}>
        <div className="section-eyebrow">Phase I · Deep Learning Demonstration</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--c-text)', marginTop: 4 }}>
          Interactive Visualizer: Occlusion Recovery
        </h2>
        <p style={{ color: 'var(--c-text-dim)', fontSize: '0.85rem', marginTop: 6 }}>
          Demonstrates how the Swin-Transformer based U-Net++ segmentation model infers road continuity beneath dense tree canopies.
        </p>
      </div>

      {/* Side-by-Side Canvas Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, justifyContent: 'center', marginBottom: 28 }}>
        
        {/* Left Side: Occluded */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: 12 }}>
            Satellite View (Occluded)
          </div>
          <div style={{ padding: 4, background: 'var(--c-border)', borderRadius: 10 }}>
            <canvas
              ref={canvasLeftRef}
              width={300}
              height={300}
              style={{ display: 'block', borderRadius: 8, background: '#111424' }}
            />
          </div>
        </div>

        {/* Right Side: Recovered */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: 12 }}>
            Model Prediction (Recovered)
          </div>
          <div style={{ padding: 4, background: 'var(--c-border)', borderRadius: 10 }}>
            <canvas
              ref={canvasRightRef}
              width={300}
              height={300}
              style={{ display: 'block', borderRadius: 8, background: '#111424' }}
            />
          </div>
        </div>

      </div>

      {/* Slider Control Group */}
      <div style={{ 
        padding: 20, 
        background: 'rgba(2, 4, 10, 0.4)', 
        border: '1px solid var(--c-border)', 
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--c-text-dim)' }}>
            Simulate Tree Canopy Coverage:
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--c-green)', fontWeight: 'bold' }}>
            {coverage}% Coverage
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--c-text-faint)' }}>10% (Sparse)</span>
          <input
            type="range"
            min="10"
            max="60"
            value={coverage}
            onChange={(e) => setCoverage(parseInt(e.target.value))}
            style={{
              flex: 1,
              height: 6,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 3,
              cursor: 'pointer',
              outline: 'none'
            }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--c-text-faint)' }}>60% (Dense)</span>
        </div>
      </div>

      {/* Formula Display Area */}
      <div style={{
        marginTop: 20,
        padding: '16px 20px',
        background: '#040712',
        border: '1px dashed rgba(56, 189, 248, 0.3)',
        borderRadius: 8,
        fontFamily: 'var(--font-mono)',
        fontSize: '0.82rem',
        textAlign: 'center',
        color: 'var(--c-text-dim)'
      }}>
        <span style={{ color: 'var(--c-cyan)', fontWeight: 600 }}>Occlusion-Recall</span> ={' '}
        <span style={{ color: 'var(--c-green)' }}>TP_occluded</span> / ({' '}
        <span style={{ color: 'var(--c-green)' }}>TP_occluded</span> +{' '}
        <span style={{ color: 'var(--c-red)' }}>FN_occluded</span> )
        <div style={{ fontSize: '0.7rem', color: 'var(--c-text-faint)', marginTop: 6 }}>
          * TP: Pixels correctly identified as road | FN: Road pixels missed (left as gaps)
        </div>
      </div>

    </div>
  );
}
