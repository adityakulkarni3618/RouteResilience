# RouteResilience — Technical Architecture

## Phase I: Occlusion-Aware Segmentation

### Model Architecture
- **Encoder**: Swin Transformer V2 (pre-trained ImageNet-22k, window_size=7)
- **Decoder**: U-Net++ with dense skip connections
- **Attention**: Spatial + Channel attention gates at each decoder level
- **Input**: 3-channel RGB tiles (512×512 px)
- **Output**: Binary road probability map (sigmoid activation)

### Loss Function
```
L = 0.4·L_dice + 0.4·L_iou + 0.1·L_boundary + 0.1·L_connectivity
```
- **L_dice**: 1 - (2·|P∩T| + ε) / (|P| + |T| + ε)
- **L_iou**: 1 - |P∩T| / |P∪T|
- **L_boundary**: Binary cross-entropy on Sobel edge map
- **L_connectivity**: Penalizes disconnected road segments

### Occlusion Handling
1. Synthetic occlusion augmentation (canopy ellipses, shadows)
2. Context-aware inference: multi-scale feature fusion
3. Long-range dependency modeling via Transformer's self-attention

---

## Phase II: Topological Reconstruction

### Skeletonization
1. Morphological thinning (Zhang-Suen algorithm)
2. Result: 1-pixel wide centerlines preserving topology
3. Node extraction: intersections (degree≥3) and endpoints (degree=1)

### MST Gap Healing
```
for each endpoint pair within max_gap_px:
    if angular_alignment < max_angle_deg:
        if not already_connected (Union-Find):
            bridge_gap(a, b)
```
- **Gap threshold**: 25px at native resolution
- **Angular constraint**: Δθ < 30° ensures natural road trajectory
- **Result**: Connectivity ratio +371% on Bengaluru test set

---

## Phase III: Network Analysis

### Betweenness Centrality
- **Algorithm**: Brandes (O(VE) time complexity)
- **Normalization**: Score ∈ [0, 1] — fraction of shortest paths through node
- **Parallelization**: multiprocessing pool across node subsets
- **Gatekeeper threshold**: Top 1% by betweenness score

### Resilience Index
```
R = L₀ / Lₚ

where:
  L₀ = avg shortest path length (baseline)
  Lₚ = avg shortest path length (post-perturbation)
  
R = 1.0  →  No degradation
R = 0.40 →  Network collapse threshold
```

### Stress Test Scenarios
| Scenario | Node Impact | Edge Impact | Use Case |
|----------|-------------|-------------|----------|
| Flood | Remove node + edges | Remove edges | Monsoon flooding |
| Accident | Degrade capacity | Weight ×10 | Major crash |
| Construction | Partial closure | Weight ×3 | Roadworks |
| Bridge Collapse | Remove node + adj. | Remove edges | Structural failure |

---

## Phase IV: Dashboard

### Frontend Stack
- React 18 + React Router v6
- Recharts for time-series and bar charts
- Leaflet.js for interactive map with GeoJSON overlays
- Canvas API for real-time network animation
- CSS custom properties (design tokens)

### Backend API
- FastAPI + Uvicorn (async, high-performance)
- Endpoints: `/api/segment`, `/api/graph/centrality`, `/api/simulate`
- CORS enabled for frontend integration

### Real-time Features
- Animated road network graph (Canvas 2D)
- Click-to-disable node interaction
- Live resilience index computation
- Processing log stream
