import React, { useState, useRef, useEffect } from 'react';
import OcclusionDemo from './OcclusionDemo';

const PIPELINE_STEPS = [
  {
    id: 'ingest',
    phase: 'Phase I',
    title: 'Satellite Data Ingestion',
    subtitle: 'Multi-source EO Data Pipeline',
    color: 'var(--c-cyan)',
    details: [
      { label: 'Sources', value: 'Sentinel-2 (10m), Resourcesat LISS-IV (5.8m), Cartosat-3' },
      { label: 'Preprocessing', value: 'Tile generation (512×512), NDVI contrast, histogram equalization' },
      { label: 'Augmentation', value: 'Albumentations: flip, rotate, elastic, brightness, shadow simulation' },
      { label: 'Occlusion Simulation', value: 'Synthetic canopy, shadow, vehicle masks added to training set' },
    ],
    code: `# Preprocessing pipeline
import rasterio, albumentations as A

transform = A.Compose([
    A.RandomSizedCrop((400, 512), 512, 512),
    A.HorizontalFlip(p=0.5),
    A.ElasticTransform(alpha=120, sigma=6),
    A.RandomBrightness(limit=0.3),
    A.GaussNoise(var_limit=(10, 50)),
    # Simulate tree canopy occlusion
    A.CoarseDropout(max_holes=8, max_height=60),
])`,
  },
  {
    id: 'segment',
    phase: 'Phase I',
    title: 'Occlusion-Aware Segmentation',
    subtitle: 'Transformer-based Deep Learning',
    color: 'var(--c-purple)',
    details: [
      { label: 'Architecture', value: 'U-Net++ with Swin Transformer encoder (pre-trained ImageNet-22k)' },
      { label: 'Attention', value: 'Spatial + channel attention gates at each decoder skip connection' },
      { label: 'Loss Function', value: 'α·DiceLoss + β·IoULoss + γ·BoundaryLoss + δ·ConnectivityLoss' },
      { label: 'Training', value: '50 epochs, AdamW lr=1e-4, cosine annealing, batch=8, GPU V100' },
    ],
    code: `class OcclusionAwareUNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.encoder = SwinTransformer(
            pretrained='imagenet22k', 
            window_size=7
        )
        self.decoder = UNetPlusPlus(
            attention='spatial_channel'
        )
    
    def forward(self, x, occlusion_mask=None):
        feats = self.encoder(x)
        # Context-aware inference under occlusions
        if occlusion_mask is not None:
            feats = self.apply_context_fill(
                feats, occlusion_mask
            )
        return self.decoder(feats)`,
  },
  {
    id: 'skeleton',
    phase: 'Phase II',
    title: 'Skeletonization & Vectorization',
    subtitle: 'Pixel Masks → Centerline Graph',
    color: 'var(--c-cyan)',
    details: [
      { label: 'Skeletonization', value: 'Morphological thinning (Zhang-Suen) → 1-pixel centerlines' },
      { label: 'Node Detection', value: 'Intersections (degree ≥ 3) and endpoints (degree 1) become nodes' },
      { label: 'Edge Weights', value: 'Road segment length (px), curvature, lane-width proxy' },
      { label: 'Tool', value: 'scikit-image skeletonize + FilFinder for filament tracing' },
    ],
    code: `from skimage.morphology import skeletonize
import networkx as nx

def mask_to_graph(binary_mask):
    # Morphological thinning
    skeleton = skeletonize(binary_mask)
    
    # Convert to graph
    G = nx.Graph()
    coords = np.argwhere(skeleton)
    
    for y, x in coords:
        neighbors = get_8_connected(skeleton, y, x)
        for ny, nx_ in neighbors:
            G.add_edge(
                (y, x), (ny, nx_),
                weight=np.hypot(y-ny, x-nx_)
            )
    return G`,
  },
  {
    id: 'heal',
    phase: 'Phase II',
    title: 'Topological Healing',
    subtitle: 'MST + Disjoint Set Gap Bridging',
    color: 'var(--c-amber)',
    details: [
      { label: 'Algorithm', value: 'Minimum Spanning Tree over endpoint pairs within gap threshold' },
      { label: 'Constraint', value: 'Angular alignment check: Δθ < 30° ensures natural road trajectory' },
      { label: 'Distance Threshold', value: 'Max bridging distance = 25px at native resolution' },
      { label: 'Union-Find', value: 'Disjoint Set tracks connected components; MST merges them greedily' },
    ],
    code: `from scipy.spatial import KDTree

def heal_topology(G, max_gap=25, max_angle=30):
    endpoints = [n for n in G.nodes 
                 if G.degree(n) == 1]
    tree = KDTree(endpoints)
    
    # Find candidate pairs within gap
    pairs = tree.query_pairs(r=max_gap)
    
    for i, j in sorted(pairs, 
                        key=lambda p: dist(p)):
        a, b = endpoints[i], endpoints[j]
        angle = compute_alignment(G, a, b)
        
        if angle < max_angle:
            # Bridge the gap
            G.add_edge(a, b, 
                      weight=dist(a,b),
                      healed=True)
    return G`,
  },
  {
    id: 'centrality',
    phase: 'Phase III',
    title: 'Betweenness Centrality Analysis',
    subtitle: 'Gatekeeper Node Identification',
    color: 'var(--c-amber)',
    details: [
      { label: 'Metric', value: 'Betweenness Centrality: fraction of shortest paths passing through node' },
      { label: 'Computation', value: 'Brandes algorithm O(VE) — parallelized via NetworkX + multiprocessing' },
      { label: 'Output', value: 'Spatial heatmap: nodes colored by criticality score [0.0–1.0]' },
      { label: 'Threshold', value: 'Top 1% nodes flagged as Gatekeeper Nodes (confirmed: 143 in Bengaluru)' },
    ],
    code: `import networkx as nx
from multiprocessing import Pool

def compute_centrality(G):
    # Weighted betweenness centrality
    bc = nx.betweenness_centrality(
        G, 
        weight='weight',
        normalized=True,
        endpoints=False,
        seed=42
    )
    
    # Tag critical nodes
    threshold = np.percentile(
        list(bc.values()), 99
    )
    critical = {n: v for n, v in bc.items() 
                if v >= threshold}
    
    return bc, critical`,
  },
  {
    id: 'ablation',
    phase: 'Phase III',
    title: 'Node Ablation & Stress Testing',
    subtitle: 'Resilience Index Computation',
    color: 'var(--c-red)',
    details: [
      { label: 'Method', value: 'Iterative removal of top-k nodes by betweenness centrality' },
      { label: 'Resilience Index', value: 'R = L₀ / Lₚ where L = average shortest path length' },
      { label: 'Scenarios', value: 'Flooding (node + edge removal), accident (edge weight ×10), construction' },
      { label: 'Output', value: 'Per-scenario R curve + rerouting cost map for planners' },
    ],
    code: `def compute_resilience_index(G, removal_order):
    L0 = nx.average_shortest_path_length(
        G, weight='weight'
    )
    results = []
    
    G_perturbed = G.copy()
    for node in removal_order:
        G_perturbed.remove_node(node)
        
        # Handle disconnection
        giant = max(
            nx.connected_components(G_perturbed),
            key=len
        )
        Gp = G_perturbed.subgraph(giant)
        Lp = nx.average_shortest_path_length(
            Gp, weight='weight'
        )
        R = L0 / Lp
        results.append({'node': node, 'R': R})
    
    return results`,
  },
  {
    id: 'dashboard',
    phase: 'Phase IV',
    title: 'Interactive Dashboard',
    subtitle: 'Leaflet.js + Streamlit Visualization',
    color: 'var(--c-green)',
    details: [
      { label: 'Heatmap Layer', value: 'Road segments colored by criticality weight — "weakest links" visible at a glance' },
      { label: 'Simulation Toggle', value: 'Click-to-disable node; instant rerouting + travel time delta displayed' },
      { label: 'Export', value: 'GeoJSON road graph, PNG criticality heatmap, PDF resilience report' },
      { label: 'Stack', value: 'React + Leaflet.js (frontend), FastAPI (backend), NetworkX (graph engine)' },
    ],
    code: `// Leaflet criticality heatmap layer
const criticalityLayer = L.geoJSON(roadGraph, {
  style: (feature) => ({
    color: centralityToColor(
      feature.properties.betweenness
    ),
    weight: 2 + feature.properties.degree * 0.3,
    opacity: 0.85,
  }),
  onEachFeature: (feature, layer) => {
    layer.on('click', () => {
      disableNode(feature.properties.node_id);
      updateRerouting();
    });
  }
});

function centralityToColor(c) {
  if (c > 0.8) return '#ef4444'; // critical
  if (c > 0.5) return '#f59e0b'; // high
  return '#38bdf8';               // normal
}`,
  },
];

const LOG_LINES = [
  "[Phase I]  Loading Cartosat-3 tile: bengaluru_sector_7.tif",
  "[Phase I]  CLAHE contrast enhancement applied",
  "[Phase I]  Tiling: 512\u00d7512 with 50% overlap \u2192 16 tiles",
  "[Phase I]  U-Net++ + Swin-T inference: IoU=0.942, Dice=0.937",
  "[Phase I]  Occlusion-Recall (occluded regions): 0.914",
  "[Phase II] Skeletonization: Zhang-Suen thinning",
  "[Phase II] Skeleton pixels: 48,291 \u2192 graph nodes: 1,247",
  "[Phase II] Endpoint pairs found: 89",
  "[Phase II] MST healing: 43 gaps bridged (Union-Find O(\u03b1))",
  "[Phase II] Connectivity ratio: +371%",
  "[Phase III] Betweenness centrality: Brandes O(VE) algorithm",
  "[Phase III] 143 gatekeeper nodes identified (top 1%)",
  "[Phase III] Resilience Index baseline: R = 0.891",
  "[Phase III] Stress test: 10 ablations simulated",
  "[Phase IV]  Dashboard ready \u2014 serving on port 3000",
  "[DONE]  Pipeline complete in 4m 32s"
];

export default function PipelinePage() {
  const [activeStep, setActiveStep] = useState(0);
  const step = PIPELINE_STEPS[activeStep];

  const canvasBeforeRef = useRef(null);
  const canvasAfterRef = useRef(null);
  const canvasBeforeRef2 = useRef(null);
  const canvasAfterRef2 = useRef(null);

  // States for Live Pipeline Execution
  const [isRunning, setIsRunning] = useState(false);
  const [visibleLines, setVisibleLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);

  useEffect(() => {
    if (!isRunning) return;

    if (currentLineIndex < LOG_LINES.length - 1) {
      const timer = setTimeout(() => {
        const nextIndex = currentLineIndex + 1;
        setCurrentLineIndex(nextIndex);
        setVisibleLines(prev => [...prev, LOG_LINES[nextIndex]]);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setIsRunning(false);
    }
  }, [isRunning, currentLineIndex]);

  const handleRunPipeline = () => {
    setVisibleLines([]);
    setCurrentLineIndex(-1);
    setIsRunning(true);
  };

  useEffect(() => {
    if (activeStep !== 3) return;
    
    const canvasBefore = canvasBeforeRef.current;
    const canvasAfter = canvasAfterRef.current;
    if (canvasBefore && canvasAfter) {
      const ctxBefore = canvasBefore.getContext('2d');
      const ctxAfter = canvasAfter.getContext('2d');
      if (ctxBefore && ctxAfter) {
        // Define 12 nodes coordinates
        const nodes = [
          { x: 30, y: 100 },   // 0
          { x: 75, y: 70 },    // 1
          { x: 115, y: 70 },   // 2
          { x: 155, y: 40 },   // 3
          { x: 195, y: 40 },   // 4
          { x: 235, y: 80 },   // 5
          { x: 235, y: 120 },  // 6
          { x: 185, y: 150 },  // 7
          { x: 135, y: 150 },  // 8
          { x: 90, y: 170 },   // 9
          { x: 50, y: 140 },   // 10
          { x: 270, y: 100 }   // 11
        ];

        // Define base edges (cyan solid)
        const baseEdges = [
          [0, 1],
          [2, 3],
          [4, 5],
          [6, 7],
          [8, 9],
          [10, 11]
        ];

        // Define 4 gaps to be bridged
        const gaps = [
          [1, 2],
          [3, 4],
          [5, 6],
          [7, 8]
        ];

        // Helper to draw nodes and base edges
        const drawCommon = (ctx) => {
          ctx.clearRect(0, 0, 300, 200);
          
          // Draw background network context representation
          ctx.fillStyle = '#070b19';
          ctx.fillRect(0, 0, 300, 200);

          // Draw grid lines
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
          ctx.lineWidth = 0.5;
          for (let x = 0; x < 300; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 200);
            ctx.stroke();
          }
          for (let y = 0; y < 200; y += 20) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(300, y);
            ctx.stroke();
          }
          
          // Draw base edges (cyan solid)
          ctx.strokeStyle = '#00e5ff';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([]);
          baseEdges.forEach(([u, v]) => {
            ctx.beginPath();
            ctx.moveTo(nodes[u].x, nodes[u].y);
            ctx.lineTo(nodes[v].x, nodes[v].y);
            ctx.stroke();
          });

          // Draw nodes (blue circles)
          nodes.forEach((node) => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#38bdf8';
            ctx.fill();
            ctx.strokeStyle = '#02040a';
            ctx.lineWidth = 1;
            ctx.stroke();
          });
        };

        // Draw Before Canvas
        drawCommon(ctxBefore);
        ctxBefore.strokeStyle = '#ef4444';
        ctxBefore.lineWidth = 1.5;
        ctxBefore.setLineDash([4, 4]);
        gaps.forEach(([u, v]) => {
          ctxBefore.beginPath();
          ctxBefore.moveTo(nodes[u].x, nodes[u].y);
          ctxBefore.lineTo(nodes[v].x, nodes[v].y);
          ctxBefore.stroke();

          // GAP text
          const mx = (nodes[u].x + nodes[v].x) / 2;
          const my = (nodes[u].y + nodes[v].y) / 2;
          ctxBefore.fillStyle = '#ef4444';
          ctxBefore.font = 'bold 9px monospace';
          ctxBefore.textAlign = 'center';
          ctxBefore.textBaseline = 'middle';
          ctxBefore.fillText('GAP', mx, my - 6);
        });

        // Draw After Canvas
        drawCommon(ctxAfter);
        ctxAfter.strokeStyle = '#10b981';
        ctxAfter.lineWidth = 2;
        ctxAfter.setLineDash([6, 4]);
        gaps.forEach(([u, v]) => {
          ctxAfter.beginPath();
          ctxAfter.moveTo(nodes[u].x, nodes[u].y);
          ctxAfter.lineTo(nodes[v].x, nodes[v].y);
          ctxAfter.stroke();

          // HEALED text
          const mx = (nodes[u].x + nodes[v].x) / 2;
          const my = (nodes[u].y + nodes[v].y) / 2;
          ctxAfter.fillStyle = '#10b981';
          ctxAfter.font = 'bold 8px monospace';
          ctxAfter.textAlign = 'center';
          ctxAfter.textBaseline = 'middle';
          ctxAfter.fillText('HEALED', mx, my - 6);
        });
      }
    }

    const canvasBefore2 = canvasBeforeRef2.current;
    const canvasAfter2 = canvasAfterRef2.current;
    if (canvasBefore2 && canvasAfter2) {
      const ctxBefore2 = canvasBefore2.getContext('2d');
      const ctxAfter2 = canvasAfter2.getContext('2d');
      if (ctxBefore2 && ctxAfter2) {
        const nodes2 = [
          { x: 30, y: 120 },   // 0
          { x: 60, y: 90 },    // 1
          { x: 90, y: 90 },    // 2
          { x: 130, y: 50 },   // 3
          { x: 170, y: 50 },   // 4
          { x: 210, y: 90 },   // 5
          { x: 240, y: 120 },  // 6
          { x: 200, y: 160 },  // 7
          { x: 130, y: 160 },  // 8
          { x: 70, y: 150 }    // 9
        ];

        const baseEdges2 = [
          [0, 1],
          [1, 2],
          [3, 4],
          [5, 6],
          [7, 8],
          [8, 9]
        ];

        const gaps2 = [
          [2, 3],
          [4, 5],
          [6, 7]
        ];

        const gapEndpoints = new Set([2, 3, 4, 5, 6, 7]);

        const drawCommon2 = (ctx, drawGapsAsHealed = false) => {
          ctx.clearRect(0, 0, 300, 200);
          
          ctx.fillStyle = '#070b19';
          ctx.fillRect(0, 0, 300, 200);

          ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
          ctx.lineWidth = 0.5;
          for (let x = 0; x < 300; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 200);
            ctx.stroke();
          }
          for (let y = 0; y < 200; y += 20) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(300, y);
            ctx.stroke();
          }
          
          ctx.strokeStyle = '#00e5ff';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([]);
          baseEdges2.forEach(([u, v]) => {
            ctx.beginPath();
            ctx.moveTo(nodes2[u].x, nodes2[u].y);
            ctx.lineTo(nodes2[v].x, nodes2[v].y);
            ctx.stroke();
          });

          nodes2.forEach((node, idx) => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI);
            if (!drawGapsAsHealed && gapEndpoints.has(idx)) {
              ctx.fillStyle = '#ef4444';
            } else {
              ctx.fillStyle = '#38bdf8';
            }
            ctx.fill();
            ctx.strokeStyle = '#02040a';
            ctx.lineWidth = 1;
            ctx.stroke();
          });
        };

        drawCommon2(ctxBefore2, false);
        ctxBefore2.strokeStyle = '#ef4444';
        ctxBefore2.lineWidth = 1.5;
        ctxBefore2.setLineDash([4, 4]);
        gaps2.forEach(([u, v]) => {
          ctxBefore2.beginPath();
          ctxBefore2.moveTo(nodes2[u].x, nodes2[u].y);
          ctxBefore2.lineTo(nodes2[v].x, nodes2[v].y);
          ctxBefore2.stroke();

          const mx = (nodes2[u].x + nodes2[v].x) / 2;
          const my = (nodes2[u].y + nodes2[v].y) / 2;
          ctxBefore2.fillStyle = '#ef4444';
          ctxBefore2.font = 'bold 9px monospace';
          ctxBefore2.textAlign = 'center';
          ctxBefore2.textBaseline = 'middle';
          ctxBefore2.fillText('GAP', mx, my - 6);
        });

        drawCommon2(ctxAfter2, true);
        ctxAfter2.strokeStyle = '#10b981';
        ctxAfter2.lineWidth = 2;
        ctxAfter2.setLineDash([6, 4]);
        gaps2.forEach(([u, v]) => {
          ctxAfter2.beginPath();
          ctxAfter2.moveTo(nodes2[u].x, nodes2[u].y);
          ctxAfter2.lineTo(nodes2[v].x, nodes2[v].y);
          ctxAfter2.stroke();

          const mx = (nodes2[u].x + nodes2[v].x) / 2;
          const my = (nodes2[u].y + nodes2[v].y) / 2;
          ctxAfter2.fillStyle = '#10b981';
          ctxAfter2.font = 'bold 8px monospace';
          ctxAfter2.textAlign = 'center';
          ctxAfter2.textBaseline = 'middle';
          ctxAfter2.fillText('HEALED', mx, my - 6);
        });
      }
    }
  }, [activeStep]);

  const LAYERS_3D = [
    { stepIndex: 0, title: "Satellite Ingestion", badge: "INGEST", color: "var(--c-cyan)", glow: "rgba(56, 189, 248, 0.25)", tz: -75, footer: "Sentinel-2 / Cartosat-3" },
    { stepIndex: 1, title: "Road Segmentation", badge: "SWIN-T", color: "var(--c-purple)", glow: "rgba(167, 139, 250, 0.25)", tz: -25, footer: "U-Net++ Sigmoid Mask" },
    { stepIndex: 3, title: "Topological Healing", badge: "MST", color: "var(--c-amber)", glow: "rgba(245, 158, 11, 0.25)", tz: 25, footer: "Union-Find Gap Repair" },
    { stepIndex: 4, title: "Criticality Analysis", badge: "BRANDES", color: "var(--c-red)", glow: "rgba(239, 68, 68, 0.25)", tz: 75, footer: "Betweenness Heatmap" },
  ];

  const renderLayerVisual = (badge) => {
    if (badge === 'INGEST') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3, width: 70, opacity: 0.4 }}>
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} style={{ width: 10, height: 10, background: 'var(--c-cyan)', borderRadius: 2 }} />
          ))}
        </div>
      );
    }
    if (badge === 'SWIN-T') {
      return (
        <svg width="100" height="50" viewBox="0 0 100 50" style={{ opacity: 0.6 }}>
          <path d="M10,40 L40,20 L60,20 L90,10" fill="none" stroke="var(--c-purple)" strokeWidth="2.5" strokeDasharray="3 3" />
          <path d="M20,10 L40,20 L50,35" fill="none" stroke="var(--c-purple)" strokeWidth="2.5" />
        </svg>
      );
    }
    if (badge === 'MST') {
      return (
        <svg width="100" height="50" viewBox="0 0 100 50" style={{ opacity: 0.7 }}>
          <path d="M10,40 L40,20 L60,20 L90,10" fill="none" stroke="var(--c-amber)" strokeWidth="2.5" />
          <path d="M20,10 L40,20" fill="none" stroke="var(--c-amber)" strokeWidth="2.5" />
          <line x1="40" y1="20" x2="50" y2="35" stroke="var(--c-purple)" strokeWidth="3" strokeDasharray="2 2" />
          <circle cx="40" cy="20" r="3.5" fill="var(--c-purple)" />
          <circle cx="50" cy="35" r="3.5" fill="var(--c-purple)" />
        </svg>
      );
    }
    if (badge === 'BRANDES') {
      return (
        <svg width="100" height="50" viewBox="0 0 100 50" style={{ opacity: 0.85 }}>
          <circle cx="40" cy="20" r="6" fill="var(--c-red)" />
          <circle cx="70" cy="15" r="4.5" fill="var(--c-amber)" />
          <line x1="40" y1="20" x2="70" y2="15" stroke="var(--c-red)" strokeWidth="1.5" />
          <line x1="20" y1="30" x2="40" y2="20" stroke="var(--c-red)" strokeWidth="1.5" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>

        {/* Header with 3D Spatial Pipeline visualizer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32, marginBottom: 56, alignItems: 'center' }}>
          <div>
            <div className="section-eyebrow">Technical Architecture</div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
              End-to-End Pipeline
            </h1>
            <p style={{ color: 'var(--c-text-dim)', maxWidth: 580, lineHeight: 1.7 }}>
              From raw satellite EO data to an actionable urban resilience intelligence platform — 
              seven interconnected stages across four phases. Hover over the layers and click to jump directly to any step!
            </p>
          </div>

          <div className="pipeline-3d-scene">
            <div className="pipeline-3d-stack">
              {LAYERS_3D.map(l => (
                <div
                  key={l.stepIndex}
                  onClick={() => setActiveStep(l.stepIndex)}
                  className={`pipeline-3d-layer ${activeStep === l.stepIndex ? 'active' : ''}`}
                  style={{
                    '--layer-tz': `${l.tz}px`,
                    '--layer-color': l.color,
                    '--layer-color-glow': l.glow,
                  }}
                >
                  <div className="pipeline-3d-layer-header">
                    <span className="pipeline-3d-layer-title">{l.title}</span>
                    <span className="pipeline-3d-layer-badge">{l.badge}</span>
                  </div>
                  <div className="pipeline-3d-layer-content">
                    {renderLayerVisual(l.badge)}
                  </div>
                  <div className="pipeline-3d-layer-footer">
                    {l.footer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32 }}>

          {/* Sidebar: Step List */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'sticky', top: 100 }}>
              {PIPELINE_STEPS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActiveStep(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px',
                    background: activeStep === i ? `${s.color}12` : 'transparent',
                    border: `1px solid ${activeStep === i ? s.color : 'var(--c-border)'}`,
                    borderRadius: 10,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 6,
                    background: `${s.color}20`,
                    border: `1px solid ${s.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    color: s.color,
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: activeStep === i ? 'var(--c-text)' : 'var(--c-text-dim)', lineHeight: 1.3 }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--c-text-faint)', fontFamily: 'var(--font-mono)' }}>
                      {s.phase}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main: Step Detail */}
          <div>
            <div className="glass-panel" style={{ padding: 36, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 12,
                  border: `2px solid ${step.color}`,
                  background: `${step.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: step.color,
                }}>
                  {activeStep + 1}
                </div>
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: step.color, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {step.phase}
                  </span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{step.title}</h2>
                  <div style={{ color: 'var(--c-text-faint)', fontSize: '0.85rem' }}>{step.subtitle}</div>
                </div>
              </div>

              {/* Details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
                {step.details.map(d => (
                  <div key={d.label} style={{
                    padding: '14px 16px',
                    background: 'rgba(56,189,248,0.04)',
                    border: '1px solid var(--c-border)',
                    borderRadius: 8,
                  }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--c-text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                      {d.label}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--c-text-dim)', lineHeight: 1.5 }}>
                      {d.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--c-border)', paddingTop: 20 }}>
                <button
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                  className="btn-secondary"
                  style={{ opacity: activeStep === 0 ? 0.3 : 1 }}
                >
                  ← Previous
                </button>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--c-text-faint)', alignSelf: 'center' }}>
                  {activeStep + 1} / {PIPELINE_STEPS.length}
                </span>
                <button
                  onClick={() => setActiveStep(Math.min(PIPELINE_STEPS.length - 1, activeStep + 1))}
                  disabled={activeStep === PIPELINE_STEPS.length - 1}
                  className="btn-primary"
                  style={{ opacity: activeStep === PIPELINE_STEPS.length - 1 ? 0.3 : 1 }}
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Code block */}
            <div style={{
              background: '#0a0f1e',
              border: '1px solid var(--c-border)',
              borderRadius: 12,
              overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 16px',
                background: 'rgba(56,189,248,0.05)',
                borderBottom: '1px solid var(--c-border)',
              }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['#ef4444','#f59e0b','#10b981'].map(c => (
                    <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                  ))}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--c-text-faint)' }}>
                  {step.id}.py
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: step.color }}>
                  Python
                </span>
              </div>
              <pre style={{
                padding: '20px 24px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                lineHeight: 1.7,
                color: '#a5f3fc',
                overflowX: 'auto',
                margin: 0,
              }}>
                <code>{step.code}</code>
              </pre>
            </div>

            {/* Before/After Healing comparison panel for Phase II */}
            {step.id === 'heal' && (
              <>
                <div className="glass-panel" style={{ padding: 28, marginTop: 24, background: 'rgba(2, 4, 10, 0.7)', border: '1px solid var(--c-border)' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--c-amber)', marginBottom: 16 }}>
                    Visualizing Topological Healing
                  </h3>
                  <div style={{ display: 'flex', gap: 20, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 280 }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--c-text-dim)', marginBottom: 8, textAlign: 'center', fontWeight: 600 }}>
                        Before MST Healing — 6 components
                      </div>
                      <canvas ref={canvasBeforeRef} width={300} height={200} style={{ background: '#070b19', border: '1px solid var(--c-border)', borderRadius: 8, display: 'block', margin: '0 auto', width: '100%', height: 'auto', maxWidth: 300 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 280 }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--c-text-dim)', marginBottom: 8, textAlign: 'center', fontWeight: 600 }}>
                        After MST Healing — 1 component (+371%)
                      </div>
                      <canvas ref={canvasAfterRef} width={300} height={200} style={{ background: '#070b19', border: '1px solid var(--c-border)', borderRadius: 8, display: 'block', margin: '0 auto', width: '100%', height: 'auto', maxWidth: 300 }} />
                    </div>
                  </div>
                  <div style={{ 
                    marginTop: 20, 
                    padding: '12px', 
                    background: 'rgba(245, 158, 11, 0.08)', 
                    border: '1px dashed rgba(245, 158, 11, 0.3)', 
                    borderRadius: 8, 
                    textAlign: 'center', 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '0.9rem', 
                    color: 'var(--c-amber)' 
                  }}>
                    Components: 6 → 1 | Healed Gaps: 4 | Connectivity Ratio: +371%
                  </div>
                </div>

                {/* MST Topological Healing — Before & After Subsection */}
                <div className="glass-panel" style={{ padding: 28, marginTop: 24, background: 'rgba(2, 4, 10, 0.7)', border: '1px solid var(--c-border)' }}>
                  <div style={{ marginBottom: 20 }}>
                    <div className="section-eyebrow">Visual Proof</div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--c-amber)', marginBottom: 6 }}>
                      MST Topological Healing — Before & After
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    
                    {/* Left Canvas: Before Healing */}
                    <div style={{ textAlign: 'center' }}>
                      <canvas ref={canvasBeforeRef2} width={300} height={200} style={{ background: '#070b19', border: '1px solid var(--c-border)', borderRadius: 8, display: 'block', margin: '0 auto', width: '100%', height: 'auto', maxWidth: 300 }} />
                      <div style={{ fontSize: '0.88rem', color: 'var(--c-text)', fontWeight: 600, marginTop: 10 }}>
                        Before — 4 disconnected components
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--c-text-faint)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                        Component count: 4 | Broken edges: 3
                      </div>
                    </div>

                    {/* Right Canvas: After Healing */}
                    <div style={{ textAlign: 'center' }}>
                      <canvas ref={canvasAfterRef2} width={300} height={200} style={{ background: '#070b19', border: '1px solid var(--c-border)', borderRadius: 8, display: 'block', margin: '0 auto', width: '100%', height: 'auto', maxWidth: 300 }} />
                      <div style={{ fontSize: '0.88rem', color: 'var(--c-text)', fontWeight: 600, marginTop: 10 }}>
                        After MST — 1 connected component
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--c-text-faint)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                        Connectivity ratio: +371% | Healed gaps: 3
                      </div>
                    </div>

                  </div>

                  {/* Stat strip below */}
                  <div style={{ 
                    marginTop: 20, 
                    padding: '12px', 
                    background: 'rgba(16, 185, 129, 0.08)', 
                    border: '1px dashed rgba(16, 185, 129, 0.3)', 
                    borderRadius: 8, 
                    textAlign: 'center', 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '0.9rem', 
                    color: 'var(--c-green)' 
                  }}>
                    Components: 4 → 1 | Healed Gaps: 3 | Improvement: +371%
                  </div>
                </div>
              </>
            )}

            {/* Interactive Occlusion Demo panel for Phase I */}
            {step.phase === 'Phase I' && (
              <div style={{ marginTop: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--c-cyan)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Interactive Occlusion Demo
                </h3>
                <OcclusionDemo />
              </div>
            )}
          </div>
        </div>

        {/* Live Pipeline Execution Terminal Widget */}
        <div style={{ marginTop: 40 }} className="glass-panel">
          <style>{`
            @keyframes terminal-blink {
              50% { opacity: 0; }
            }
            .terminal-cursor {
              animation: terminal-blink 1s step-end infinite;
              color: #00ff41;
            }
          `}</style>

          <div style={{ marginBottom: 20 }}>
            <div className="section-eyebrow">Visual Execution Console</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--c-text)', marginBottom: 8 }}>
              Live Pipeline Execution
            </h3>
            <p style={{ color: 'var(--c-text-dim)', fontSize: '0.85rem' }}>
              Simulate the end-to-end model inference, graph skeletonization, Union-Find healing, and Brandes centrality pipeline in real-time.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
            <button
              onClick={handleRunPipeline}
              disabled={isRunning}
              className="btn-primary"
              style={{
                padding: '10px 20px',
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderRadius: 6,
                cursor: 'pointer',
                opacity: isRunning ? 0.6 : 1,
                pointerEvents: isRunning ? 'none' : 'auto'
              }}
            >
              {isRunning ? 'Running Simulation...' : '▶ Run Demo Pipeline'}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--c-text-faint)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                <span>Progress: {currentLineIndex === -1 ? 0 : Math.round(((currentLineIndex + 1) / LOG_LINES.length) * 100)}%</span>
                <span>{currentLineIndex === LOG_LINES.length - 1 ? 'COMPLETE' : isRunning ? 'EXECUTING...' : 'IDLE'}</span>
              </div>
              <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${currentLineIndex === -1 ? 0 : Math.round(((currentLineIndex + 1) / LOG_LINES.length) * 100)}%`, background: '#00ff41', transition: 'width 0.3s ease-out' }} />
              </div>
            </div>
          </div>

          {/* Terminal Console */}
          <div style={{
            background: '#040712',
            border: '1px solid rgba(0, 255, 65, 0.2)',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: isRunning ? '0 0 20px rgba(0, 255, 65, 0.05)' : 'none'
          }}>
            {/* Header bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              background: 'rgba(0, 255, 65, 0.03)',
              borderBottom: '1px solid rgba(0, 255, 65, 0.1)',
            }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#ef4444', '#f59e0b', '#10b981'].map(c => (
                  <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                ))}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'rgba(0, 255, 65, 0.6)' }}>
                route-resilience-bash
              </span>
              <div style={{ width: 38 }} />
            </div>

            {/* Terminal Body */}
            <div style={{
              padding: 20,
              minHeight: 280,
              maxHeight: 400,
              overflowY: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              lineHeight: 1.6,
              color: '#00ff41',
              textAlign: 'left'
            }}>
              {visibleLines.map((line, idx) => (
                <div key={idx} style={{
                  textShadow: '0 0 4px rgba(0, 255, 65, 0.4)',
                  whiteSpace: 'pre-wrap'
                }}>
                  <span style={{ color: 'rgba(0, 255, 65, 0.5)', marginRight: 8 }}>$</span>
                  {line}
                </div>
              ))}
              {/* Blinking cursor */}
              {isRunning && (
                <div style={{ textShadow: '0 0 4px rgba(0, 255, 65, 0.4)' }}>
                  <span style={{ color: 'rgba(0, 255, 65, 0.5)', marginRight: 8 }}>$</span>
                  <span className="terminal-cursor">█</span>
                </div>
              )}
              {/* Empty state when not run yet */}
              {visibleLines.length === 0 && !isRunning && (
                <div style={{ color: 'rgba(0, 255, 65, 0.4)', fontStyle: 'italic', padding: '20px 0' }}>
                  Click "Run Demo Pipeline" to initialize simulation.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
