import React, { useRef, useEffect } from 'react';

export default function NetworkCanvas({ width = 800, height = 500 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Nodes representing city intersections
    const nodes = [];
    const edges = [];
    
    // Generate nodes in clusters (simulating city blocks)
    const clusters = [
      { x: width * 0.25, y: height * 0.3, r: 100, count: 12 },
      { x: width * 0.5,  y: height * 0.5, r: 130, count: 16 },
      { x: width * 0.75, y: height * 0.3, r: 90,  count: 11 },
      { x: width * 0.35, y: height * 0.7, r: 80,  count: 9 },
      { x: width * 0.7,  y: height * 0.7, r: 75,  count: 7 },
    ];

    clusters.forEach((cluster, ci) => {
      for (let i = 0; i < cluster.count; i++) {
        const angle = (i / cluster.count) * Math.PI * 2 + Math.random() * 0.5;
        const dist = Math.random() * cluster.r;
        nodes.push({
          id: nodes.length,
          x: cluster.x + Math.cos(angle) * dist,
          y: cluster.y + Math.sin(angle) * dist,
          cluster: ci,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          baseX: 0, baseY: 0,
          centrality: Math.random(),
          pulsePhase: Math.random() * Math.PI * 2,
          critical: Math.random() > 0.85,
          dataFlow: Math.random() > 0.7,
        });
      }
    });

    nodes.forEach(n => { n.baseX = n.x; n.baseY = n.y; });

    // Build edges (MST-style + cross-cluster connections)
    nodes.forEach((n, i) => {
      const distances = nodes.map((m, j) => ({ j, d: Math.hypot(n.x - m.x, n.y - m.y) }))
        .filter(({ j }) => j !== i)
        .sort((a, b) => a.d - b.d);
      
      // Connect to 2-3 nearest
      distances.slice(0, 2 + Math.floor(Math.random() * 2)).forEach(({ j, d }) => {
        if (d < 160 && !edges.find(e => (e.a === j && e.b === i))) {
          edges.push({
            a: i, b: j,
            broken: Math.random() > 0.82,
            flowOffset: Math.random() * Math.PI * 2,
            weight: d,
          });
        }
      });
    });

    // Data packets traveling along edges
    const packets = Array.from({ length: 8 }, () => ({
      edgeIdx: Math.floor(Math.random() * edges.length),
      t: Math.random(),
      speed: 0.004 + Math.random() * 0.006,
      color: Math.random() > 0.5 ? '#38bdf8' : '#f59e0b',
    }));

    let frame = 0;
    let disabledNode = -1;

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Background gradient
      const bg = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.7);
      bg.addColorStop(0, 'rgba(13,22,48,0.6)');
      bg.addColorStop(1, 'rgba(4,8,15,0)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      frame++;
      const t = frame * 0.012;

      // Animate nodes (gentle drift)
      nodes.forEach(n => {
        n.x = n.baseX + Math.sin(t * 0.8 + n.pulsePhase) * 1.5;
        n.y = n.baseY + Math.cos(t * 0.6 + n.pulsePhase) * 1.2;
      });

      // Draw edges
      edges.forEach(edge => {
        const a = nodes[edge.a], b = nodes[edge.b];
        const isDisabled = edge.a === disabledNode || edge.b === disabledNode;

        if (edge.broken || isDisabled) {
          // Dashed broken road
          ctx.beginPath();
          ctx.setLineDash([6, 10]);
          ctx.strokeStyle = isDisabled
            ? 'rgba(239,68,68,0.4)'
            : 'rgba(245,158,11,0.25)';
          ctx.lineWidth = 1.5;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          // Solid road with flow glow
          const flowAlpha = 0.4 + 0.3 * Math.sin(t * 1.5 + edge.flowOffset);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(56,189,248,${flowAlpha * 0.5})`;
          ctx.lineWidth = 1.5;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();

          // Highlight path glow
          if (edge.weight < 90) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(56,189,248,${flowAlpha * 0.25})`;
            ctx.lineWidth = 5;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      });

      // Draw data packets
      packets.forEach(p => {
        p.t += p.speed;
        if (p.t > 1) {
          p.t = 0;
          p.edgeIdx = Math.floor(Math.random() * edges.length);
          p.speed = 0.004 + Math.random() * 0.006;
        }
        const edge = edges[p.edgeIdx];
        if (!edge || edge.broken) return;
        const a = nodes[edge.a], b = nodes[edge.b];
        const px = a.x + (b.x - a.x) * p.t;
        const py = a.y + (b.y - a.y) * p.t;

        ctx.beginPath();
        const grad = ctx.createRadialGradient(px, py, 0, px, py, 6);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw nodes
      nodes.forEach((n, i) => {
        const pulse = Math.sin(t * 2 + n.pulsePhase) * 0.5 + 0.5;
        const isDisabled = i === disabledNode;
        const r = n.critical ? 7 + pulse * 3 : 4 + pulse;

        if (isDisabled) {
          // Red X for disabled node
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(239,68,68,0.9)';
          ctx.lineWidth = 2;
          ctx.moveTo(n.x - 8, n.y - 8); ctx.lineTo(n.x + 8, n.y + 8);
          ctx.moveTo(n.x + 8, n.y - 8); ctx.lineTo(n.x - 8, n.y + 8);
          ctx.stroke();

          // Ripple
          const rr = 15 + pulse * 10;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(239,68,68,${0.5 - pulse * 0.4})`;
          ctx.lineWidth = 1;
          ctx.arc(n.x, n.y, rr, 0, Math.PI * 2);
          ctx.stroke();
        } else if (n.critical) {
          // Amber critical node
          ctx.beginPath();
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r + 8);
          g.addColorStop(0, 'rgba(245,158,11,0.9)');
          g.addColorStop(0.5, 'rgba(245,158,11,0.3)');
          g.addColorStop(1, 'transparent');
          ctx.fillStyle = g;
          ctx.arc(n.x, n.y, r + 8, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.fillStyle = '#f59e0b';
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Normal node
          ctx.beginPath();
          ctx.fillStyle = `rgba(56,189,248,${0.6 + pulse * 0.4})`;
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animRef.current = requestAnimationFrame(draw);
    }

    // Click to disable/enable nodes
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;

      let closest = -1, closestD = Infinity;
      nodes.forEach((n, i) => {
        const d = Math.hypot(n.x - mx, n.y - my);
        if (d < closestD) { closestD = d; closest = i; }
      });

      if (closestD < 25) {
        disabledNode = disabledNode === closest ? -1 : closest;
      }
    };

    canvas.addEventListener('click', handleClick);
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('click', handleClick);
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width: '100%',
        height: 'auto',
        borderRadius: 16,
        cursor: 'crosshair',
        display: 'block',
      }}
    />
  );
}
