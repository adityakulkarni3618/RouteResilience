import React from 'react';
import { getShiftedNodes, getShiftedGeoJSON, getActiveLocation } from '../utils/locationHelper';

// Bengaluru road network (mock GeoJSON - in production, built from OSM + segmentation)
const ROAD_GEOJSON = {
  type: "FeatureCollection",
  features: [
    // Major arterials
    { type: "Feature", properties: { name: "Outer Ring Road", betweenness: 0.91, type: "arterial", lane_count: 6 },
      geometry: { type: "LineString", coordinates: [[77.6228,12.9177],[77.6500,12.9300],[77.6962,13.0050]] } },
    { type: "Feature", properties: { name: "NICE Road", betweenness: 0.78, type: "arterial", lane_count: 4 },
      geometry: { type: "LineString", coordinates: [[77.5950,12.8976],[77.6100,12.9100],[77.6228,12.9177]] } },
    { type: "Feature", properties: { name: "Bannerghatta Road", betweenness: 0.61, type: "primary", lane_count: 4 },
      geometry: { type: "LineString", coordinates: [[77.5930,12.8400],[77.5950,12.8700],[77.5950,12.8976]] } },
    { type: "Feature", properties: { name: "Hosur Road", betweenness: 0.67, type: "primary", lane_count: 4 },
      geometry: { type: "LineString", coordinates: [[77.6228,12.9177],[77.6400,12.8900],[77.6770,12.8400]] } },
    { type: "Feature", properties: { name: "Old Airport Road", betweenness: 0.73, type: "primary", lane_count: 4 },
      geometry: { type: "LineString", coordinates: [[77.6228,12.9177],[77.6600,12.9400],[77.7001,12.9591]] } },
    { type: "Feature", properties: { name: "Whitefield Road", betweenness: 0.55, type: "secondary", lane_count: 2 },
      geometry: { type: "LineString", coordinates: [[77.7001,12.9591],[77.7200,12.9640],[77.7499,12.9698]] } },
    { type: "Feature", properties: { name: "Hebbal Flyover", betweenness: 0.79, type: "arterial", lane_count: 6 },
      geometry: { type: "LineString", coordinates: [[77.5970,13.0350],[77.5970,13.0100],[77.6100,12.9800]] } },
    { type: "Feature", properties: { name: "Tumkur Road", betweenness: 0.52, type: "primary", lane_count: 4 },
      geometry: { type: "LineString", coordinates: [[77.5700,13.0100],[77.5800,13.0200],[77.5970,13.0350]] } },
    { type: "Feature", properties: { name: "Mysore Road", betweenness: 0.58, type: "primary", lane_count: 4 },
      geometry: { type: "LineString", coordinates: [[77.5200,12.9600],[77.5500,12.9700],[77.5800,12.9800]] } },
    { type: "Feature", properties: { name: "MG Road", betweenness: 0.44, type: "secondary", lane_count: 2 },
      geometry: { type: "LineString", coordinates: [[77.6100,12.9750],[77.6200,12.9780],[77.6350,12.9800]] } },
    { type: "Feature", properties: { name: "Yelahanka Road", betweenness: 0.48, type: "secondary", lane_count: 2 },
      geometry: { type: "LineString", coordinates: [[77.5963,13.1007],[77.5970,13.0600],[77.5970,13.0350]] } },
    { type: "Feature", properties: { name: "KR Puram Road", betweenness: 0.84, type: "arterial", lane_count: 4 },
      geometry: { type: "LineString", coordinates: [[77.6962,13.0050],[77.6800,13.0000],[77.6600,12.9800]] } },
    // Broken / occluded roads (simulated)
    { type: "Feature", properties: { name: "Canopy-Occluded Lane", betweenness: 0.32, type: "local", broken: true },
      geometry: { type: "LineString", coordinates: [[77.6300,12.9500],[77.6350,12.9520],[77.6400,12.9540]] } },
    { type: "Feature", properties: { name: "Shadow Zone Road", betweenness: 0.28, type: "local", broken: true },
      geometry: { type: "LineString", coordinates: [[77.6150,12.9600],[77.6200,12.9620]] } },
    // Healed roads (post-MST)
    { type: "Feature", properties: { name: "Healed Connector A", betweenness: 0.35, type: "local", healed: true },
      geometry: { type: "LineString", coordinates: [[77.6228,12.9177],[77.6150,12.9200],[77.6100,12.9300]] } },
    { type: "Feature", properties: { name: "Healed Connector B", betweenness: 0.29, type: "local", healed: true },
      geometry: { type: "LineString", coordinates: [[77.6500,12.9300],[77.6550,12.9350],[77.6600,12.9400]] } },
  ]
};

const GATEKEEPER_NODES = [
  { id: 0, name: "Silk Board Junction", lat: 12.9177, lng: 77.6228, bc: 0.91, degree: 12, risk: "CRITICAL" },
  { id: 1, name: "KR Puram Bridge",     lat: 13.0050, lng: 77.6962, bc: 0.84, degree: 10, risk: "CRITICAL" },
  { id: 2, name: "Hebbal Flyover",      lat: 13.0350, lng: 77.5970, bc: 0.79, degree: 9,  risk: "CRITICAL" },
  { id: 3, name: "Marathahalli Jn",     lat: 12.9591, lng: 77.7001, bc: 0.73, degree: 8,  risk: "HIGH" },
  { id: 4, name: "Electronic City",     lat: 12.8400, lng: 77.6770, bc: 0.67, degree: 7,  risk: "HIGH" },
  { id: 5, name: "Bannerghatta Road",   lat: 12.8976, lng: 77.5950, bc: 0.61, degree: 7,  risk: "HIGH" },
  { id: 6, name: "Whitefield Hub",      lat: 12.9698, lng: 77.7499, bc: 0.55, degree: 6,  risk: "MEDIUM" },
  { id: 7, name: "Yelahanka",           lat: 13.1007, lng: 77.5963, bc: 0.48, degree: 5,  risk: "MEDIUM" },
];

function bcToColor(bc, disabled = false, healed = false, broken = false) {
  if (disabled) return '#ef4444';
  if (broken)   return '#f59e0b';
  if (healed)   return '#a78bfa';
  const score = typeof bc === 'number' && !isNaN(bc) ? bc : 0.5;
  if (score >= 0.8) return '#ef4444';
  if (score >= 0.6) return '#f59e0b';
  if (score >= 0.4) return '#38bdf8';
  return '#10b981';
}

function bcToWeight(bc) {
  const score = typeof bc === 'number' && !isNaN(bc) ? bc : 0.5;
  return 2 + score * 4;
}

function sanitizeGeoJSON(geoJSON) {
  if (!geoJSON || geoJSON.type !== 'FeatureCollection' || !Array.isArray(geoJSON.features)) {
    return { type: 'FeatureCollection', features: [] };
  }

  const isValidCoord = (p) =>
    Array.isArray(p) &&
    p.length >= 2 &&
    typeof p[0] === 'number' && !isNaN(p[0]) && isFinite(p[0]) &&
    typeof p[1] === 'number' && !isNaN(p[1]) && isFinite(p[1]);

  const cleanFeatures = geoJSON.features
    .filter(feature => feature && feature.geometry)
    .map(feature => {
      const geom = feature.geometry;
      if (geom.type === 'LineString') {
        // Filter out any individual invalid coordinate points within the LineString
        const cleanCoords = (geom.coordinates || []).filter(isValidCoord);
        if (cleanCoords.length < 2) return null; // Drop degenerate lines
        return {
          ...feature,
          geometry: { ...geom, coordinates: cleanCoords }
        };
      }
      return feature;
    })
    .filter(Boolean);

  return {
    ...geoJSON,
    features: cleanFeatures
  };
}

function sanitizeNodes(nodes) {
  if (!Array.isArray(nodes)) return [];
  return nodes.filter(node => 
    node && 
    typeof node.lat === 'number' && !isNaN(node.lat) && isFinite(node.lat) &&
    typeof node.lng === 'number' && !isNaN(node.lng) && isFinite(node.lng)
  );
}

export default function CriticalityMap({ activeLoc, disabledNodes = [], showHealed = true, showBroken = true, showReroute = false, onNodeToggle, customNodes, customGeoJSON }) {
  const loc = activeLoc || getActiveLocation();
  const activeNodes = React.useMemo(() => {
    let nodes = customNodes;
    if (!nodes) {
      // Reference coordinates to satisfy ESLint dependency checker
      void [loc.lat, loc.lng];
      nodes = getShiftedNodes(GATEKEEPER_NODES);
    }
    return sanitizeNodes(nodes);
  }, [loc.lat, loc.lng, customNodes]);

  const activeGeoJSON = React.useMemo(() => {
    let geo = customGeoJSON;
    if (!geo) {
      // Reference coordinates to satisfy ESLint dependency checker
      void [loc.lat, loc.lng];
      geo = getShiftedGeoJSON(ROAD_GEOJSON);
    }
    return sanitizeGeoJSON(geo);
  }, [loc.lat, loc.lng, customGeoJSON]);

  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const layersRef = React.useRef({ roads: null, nodes: null, reroute: null });
  const [mapReady, setMapReady] = React.useState(false);

  // Synced right map refs & state
  const mapRightRef = React.useRef(null);
  const mapInstanceRightRef = React.useRef(null);
  const [splitMode, setSplitMode] = React.useState(false);
  const isSyncingRef = React.useRef(false);

  // Update view when coordinates change
  React.useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([loc.lat, loc.lng], mapInstanceRef.current.getZoom());
    }
  }, [loc.lat, loc.lng]);

  React.useEffect(() => {
    if (!mapRef.current) return;
    let timer;

    // Dynamically load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const initMap = () => {
      if (!window.L || mapInstanceRef.current) return;
      const L = window.L;
      const initialLoc = getActiveLocation();

      const map = L.map(mapRef.current, {
        center: [initialLoc.lat, initialLoc.lng],
        zoom: 11,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Dark OSM tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      
      // Delay setting mapReady and invalidate size to avoid layout crashes in dynamic containers
      timer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          setMapReady(true);
        }
      }, 100);
    };

    if (window.L) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (mapInstanceRightRef.current) {
        mapInstanceRightRef.current.remove();
        mapInstanceRightRef.current = null;
      }
      setMapReady(false);
    };
  }, []);

  // Sync right map when splitMode is active
  React.useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const L = window.L;
    const mapLeft = mapInstanceRef.current;
    let timerId;

    if (splitMode) {
      if (!mapRightRef.current || mapInstanceRightRef.current) return;

      const mapRight = L.map(mapRightRef.current, {
        center: mapLeft.getCenter(),
        zoom: mapLeft.getZoom(),
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRight);

      mapInstanceRightRef.current = mapRight;

      // Bidirectional synchronization handlers
      const sync = (source, target) => {
        if (isSyncingRef.current) return;
        isSyncingRef.current = true;
        target.setView(source.getCenter(), source.getZoom(), { animate: false });
        isSyncingRef.current = false;
      };

      const handleLeftMove = () => sync(mapLeft, mapRight);
      const handleRightMove = () => sync(mapRight, mapLeft);

      mapLeft.on('move', handleLeftMove);
      mapRight.on('move', handleRightMove);

      timerId = setTimeout(() => {
        if (mapLeft && mapLeft._container) mapLeft.invalidateSize();
        if (mapRight && mapRight._container) mapRight.invalidateSize();
      }, 50);

      return () => {
        clearTimeout(timerId);
        mapLeft.off('move', handleLeftMove);
        if (mapInstanceRightRef.current) {
          mapInstanceRightRef.current.remove();
          mapInstanceRightRef.current = null;
        }
      };
    } else {
      if (mapInstanceRightRef.current) {
        mapInstanceRightRef.current.remove();
        mapInstanceRightRef.current = null;
      }
      timerId = setTimeout(() => {
        if (mapLeft && mapLeft._container) {
          mapLeft.invalidateSize();
        }
      }, 50);

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [splitMode, mapReady]);

  // Update layers when state changes
  React.useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    // Clear existing layers
    if (layersRef.current.roads) map.removeLayer(layersRef.current.roads);
    if (layersRef.current.nodes) map.removeLayer(layersRef.current.nodes);
    if (layersRef.current.reroute) map.removeLayer(layersRef.current.reroute);

    // ── Road criticality heatmap layer ──
    const roadLayer = L.geoJSON(activeGeoJSON, {
      filter: (feature) => {
        if (feature.properties.broken && !showBroken) return false;
        if (feature.properties.healed && !showHealed) return false;
        return true;
      },
      style: (feature) => {
        try {
          const p = feature.properties || {};
          const disabledRoad = disabledNodes.some(id => {
            const node = activeNodes.find(n => n.id === id);
            if (!node) return false;
            const coords = feature.geometry?.coordinates;
            if (!Array.isArray(coords)) return false;
            return coords.some(pt => {
              if (!Array.isArray(pt) || pt.length < 2) return false;
              const [lng, lat] = pt;
              if (typeof lng !== 'number' || typeof lat !== 'number') return false;
              return Math.hypot(lat - node.lat, lng - node.lng) < 0.015;
            });
          });
          const betweenness = typeof p.betweenness === 'number' ? p.betweenness : 0.5;
          return {
            color: bcToColor(betweenness, disabledRoad, !!p.healed, !!p.broken),
            weight: p.broken ? 1.5 : bcToWeight(betweenness),
            opacity: p.broken ? 0.5 : disabledRoad ? 0.8 : 0.85,
            dashArray: p.broken ? '6 8' : p.healed ? '4 4' : null,
          };
        } catch (err) {
          console.error("Error in roadLayer style:", err);
          return { color: '#10b981', weight: 2, opacity: 0.8 };
        }
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        layer.bindPopup(`
          <div style="font-family: monospace; font-size: 12px; color: #e2e8f0; background: #0d1630; padding: 10px; border-radius: 6px; min-width: 180px;">
            <div style="font-weight:700; color:#38bdf8; margin-bottom:6px;">${p.name}</div>
            <div style="color:#94a3b8;">Betweenness: <span style="color:#f59e0b;">${typeof p.betweenness === 'number' ? p.betweenness.toFixed(3) : 'N/A'}</span></div>
            <div style="color:#94a3b8;">Type: ${p.type}</div>
            ${p.broken ? '<div style="color:#f59e0b; margin-top:4px;">⚠ Occluded — healed by MST</div>' : ''}
            ${p.healed ? '<div style="color:#a78bfa; margin-top:4px;">✓ MST-healed connector</div>' : ''}
          </div>
        `, { className: 'dark-popup' });
      }
    }).addTo(map);

    // ── Gatekeeper Node markers ──
    const nodeLayer = L.layerGroup();
    activeNodes.forEach(node => {
      const isDisabled = disabledNodes.includes(node.id);
      // Normalize all fields with safe defaults in case backend omits them
      const bc = typeof node.bc === 'number' && isFinite(node.bc) ? node.bc : 0.3;
      const lat = typeof node.lat === 'number' && !isNaN(node.lat) && isFinite(node.lat) ? node.lat : null;
      const lng = typeof node.lng === 'number' && !isNaN(node.lng) && isFinite(node.lng) ? node.lng : null;
      
      // Discard invalid nodes completely rather than placing them at [0,0]
      if (lat === null || lng === null) return;

      const degree = node.degree ?? '—';
      const risk = node.risk ?? 'UNKNOWN';
      const name = node.name ?? 'Junction';

      const color = isDisabled ? '#ef4444' : bc >= 0.8 ? '#ef4444' : bc >= 0.6 ? '#f59e0b' : '#38bdf8';
      const size = Math.max(6, 8 + bc * 10);

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            width:${size}px; height:${size}px;
            border-radius:50%;
            background:${color};
            border:2px solid ${isDisabled ? '#ff6b6b' : 'rgba(255,255,255,0.3)'};
            box-shadow: 0 0 ${isDisabled ? 16 : 8}px ${color};
            cursor:pointer;
            ${isDisabled ? 'animation: pulse 1s infinite alternate;' : ''}
          "></div>
        `,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2],
      });

      const marker = L.marker([lat, lng], { icon })
        .bindPopup(`
          <div style="font-family: monospace; font-size: 12px; color: #e2e8f0; background: #0d1630; padding: 12px; border-radius: 6px; min-width: 200px;">
            <div style="font-weight:700; color:${color}; margin-bottom:8px;">${name}</div>
            <div style="color:#94a3b8;">Coords: <span style="color:#38bdf8;">${lat.toFixed(4)}°, ${lng.toFixed(4)}°</span></div>
            <div style="color:#94a3b8;">Betweenness: <span style="color:${color}; font-weight:600;">${bc.toFixed(3)}</span></div>
            <div style="color:#94a3b8;">Degree: ${degree} connections</div>
            <div style="color:#94a3b8;">Risk: <span style="color:${color};">${risk}</span></div>
            ${isDisabled ? '<div style="color:#ef4444; margin-top:6px; font-weight:600;">🚫 DISABLED (simulated failure)</div>' : ''}
          </div>
        `, { className: 'dark-popup' });

      if (onNodeToggle) {
        marker.on('click', () => {
          onNodeToggle(node.id);
        });
      }

      marker.addTo(nodeLayer);
    });
    nodeLayer.addTo(map);

    // ── Rerouting overlay ──
    if (showReroute) {
      const rerouteLayer = L.layerGroup();
      const centerLat = loc.lat;
      const centerLng = loc.lng;

      const routes = [
        {
          id: 1,
          coords: [
            [centerLat + 0.01, centerLng - 0.02],
            [centerLat + 0.02, centerLng],
            [centerLat + 0.01, centerLng + 0.02]
          ],
          delay: 12
        },
        {
          id: 2,
          coords: [
            [centerLat - 0.01, centerLng - 0.02],
            [centerLat - 0.02, centerLng],
            [centerLat - 0.01, centerLng + 0.02]
          ],
          delay: 25
        },
        {
          id: 3,
          coords: [
            [centerLat - 0.02, centerLng + 0.01],
            [centerLat, centerLng + 0.03],
            [centerLat + 0.02, centerLng + 0.01]
          ],
          delay: 18
        },
        {
          id: 4,
          coords: [
            [centerLat - 0.02, centerLng - 0.01],
            [centerLat, centerLng - 0.03],
            [centerLat + 0.02, centerLng - 0.01]
          ],
          delay: 8
        }
      ];

      routes.forEach(route => {
        const isValid = route.coords.every(([lat, lng]) => typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng));
        if (isValid && route.coords.length >= 2) {
          L.polyline(
            route.coords,
            { color: '#10b981', weight: 3, dashArray: '8 6', opacity: 0.8 }
          ).bindPopup(`
            <div style="font-family: monospace; font-size: 11px; color: #e2e8f0; background: #0d1630; padding: 8px; border-radius: 6px;">
              Alt Route ${route.id} — Est. +${route.delay} min
            </div>
          `, { className: 'dark-popup' })
          .addTo(rerouteLayer);
        }
      });

      rerouteLayer.addTo(map);
      layersRef.current.reroute = rerouteLayer;
    }

    layersRef.current.roads = roadLayer;
    layersRef.current.nodes = nodeLayer;

    // Add custom CSS for popups
    if (!document.getElementById('leaflet-dark-popup')) {
      const style = document.createElement('style');
      style.id = 'leaflet-dark-popup';
      style.textContent = `
        .dark-popup .leaflet-popup-content-wrapper {
          background: #0d1630 !important;
          border: 1px solid rgba(56,189,248,0.3) !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
          color: #e2e8f0 !important;
        }
        .dark-popup .leaflet-popup-tip { background: #0d1630 !important; }
        .dark-popup .leaflet-popup-content { margin: 0 !important; }
        .leaflet-popup-close-button { color: #94a3b8 !important; }
      `;
      document.head.appendChild(style);
    }
  }, [mapReady, disabledNodes, showHealed, showBroken, showReroute, onNodeToggle, activeGeoJSON, activeNodes, activeLoc, loc.lat, loc.lng]);

  return (
    <div style={{ position: 'relative', height: '100%', minHeight: 440, borderRadius: 12, overflow: 'hidden' }}>
      
      {/* Synced Maps split screen view */}
      <div className={splitMode ? "split-map-container" : ""} style={{ width: '100%', height: '100%' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        {splitMode && (
          <div ref={mapRightRef} className="osm-standard-map" style={{ width: '100%', height: '100%' }} />
        )}
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 40, left: 12, zIndex: 1000,
        background: 'rgba(8,15,30,0.92)',
        border: '1px solid rgba(56,189,248,0.2)',
        borderRadius: 8, padding: '10px 14px',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--c-text-faint)', letterSpacing: '0.1em', marginBottom: 8 }}>
          CRITICALITY LEGEND
        </div>
        {[
          { color: '#ef4444', label: 'Critical (BC > 0.8)' },
          { color: '#f59e0b', label: 'High (BC 0.6–0.8)' },
          { color: '#38bdf8', label: 'Medium (BC 0.4–0.6)' },
          { color: '#10b981', label: 'Low (BC < 0.4)' },
          { color: '#a78bfa', label: 'MST Healed', dash: true },
          { color: '#f59e0b', label: 'Occluded / Broken', dash: true },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{
              width: 20, height: 3,
              background: l.dash ? 'transparent' : l.color,
              borderTop: l.dash ? `2px dashed ${l.color}` : 'none',
              borderRadius: 2,
            }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--c-text-dim)' }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Split Mode toggle button */}
      <button 
        onClick={() => setSplitMode(prev => !prev)}
        style={{
          position: 'absolute', top: 10, left: 10, zIndex: 1000,
          background: splitMode ? 'rgba(56,189,248,0.25)' : 'rgba(8,15,30,0.85)',
          border: splitMode ? '1px solid var(--c-cyan)' : '1px solid rgba(56,189,248,0.2)',
          borderRadius: 6, padding: '6px 12px',
          fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#ffffff',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          backdropFilter: 'blur(10px)', transition: 'all 0.2s',
          fontWeight: 600,
        }}
      >
        <span>🗺️</span>
        {splitMode ? "Single View" : "Split Compare: OSM vs Model"}
      </button>

      {/* Data source badge */}
      <div style={{
        position: 'absolute', top: 10, right: 10, zIndex: 1000,
        background: 'rgba(8,15,30,0.85)',
        border: '1px solid rgba(56,189,248,0.2)',
        borderRadius: 6, padding: '4px 10px',
        fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--c-cyan)',
      }}>
        OSM + Cartosat-3 · {(loc && loc.name) ? loc.name.split(',')[0] : 'Bengaluru'}
      </div>
    </div>
  );
}
