import React, { useState, useEffect } from 'react';
import { getShiftedNodes, getActiveLocation } from '../utils/locationHelper';
import { Viewer, Entity, CameraFlyTo } from 'resium';
import { Cartesian3 } from 'cesium';

// Set base URL to CDN so Webpack doesn't need copy plugin configurations!
window.CESIUM_BASE_URL = 'https://unpkg.com/cesium@1.115.0/Build/Cesium/';

const CITY_NODES = [
  { id: 0, name: 'Silk Board Junction',  bc: 0.91, degree: 12, affected: 125000, lat: 12.9177, lng: 77.6228, road_type: 'arterial' },
  { id: 1, name: 'KR Puram Bridge',      bc: 0.84, degree: 10, affected: 98000,  lat: 13.0050, lng: 77.6962, road_type: 'arterial' },
  { id: 2, name: 'Hebbal Flyover',       bc: 0.79, degree: 9,  affected: 87000,  lat: 13.0350, lng: 77.5970, road_type: 'collector' },
  { id: 3, name: 'Marathahalli Jn.',     bc: 0.73, degree: 8,  affected: 72000,  lat: 12.9591, lng: 77.7001, road_type: 'collector' },
  { id: 4, name: 'Electronic City Toll', bc: 0.67, degree: 7,  affected: 61000,  lat: 12.8400, lng: 77.6770, road_type: 'collector' },
  { id: 5, name: 'Bannerghatta Road',    bc: 0.61, degree: 7,  affected: 54000,  lat: 12.8976, lng: 77.5950, road_type: 'collector' },
  { id: 6, name: 'Whitefield Hub',       bc: 0.55, degree: 6,  affected: 43000,  lat: 12.9698, lng: 77.7499, road_type: 'local' },
  { id: 7, name: 'Yelahanka',            bc: 0.48, degree: 5,  affected: 31000,  lat: 13.1007, lng: 77.5963, road_type: 'local' },
];

const createPinSvg = (color) => {
  return `data:image/svg+xml;utf8,` + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <path d="M16 3C10.5 3 6 7.5 6 13c0 5.5 10 16 10 16s10-10.5 10-16c0-5.5-4.5-10-10-10z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
      <circle cx="16" cy="13" r="4" fill="#000000"/>
    </svg>
  `);
};

export default function CesiumView({ activeLoc, customNodes }) {
  const loc = activeLoc || getActiveLocation();
  const activeNodes = customNodes || getShiftedNodes(CITY_NODES);

  const [selectedNode, setSelectedNode] = useState(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    // Dynamically load Cesium CSS from CDN
    if (!document.getElementById('cesium-css')) {
      const link = document.createElement('link');
      link.id = 'cesium-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/cesium@1.115.0/Build/Cesium/Widgets/widgets.css';
      document.head.appendChild(link);
    }

    // Verify WebGL Support
    try {
      const canvas = document.createElement('canvas');
      const support = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      setHasWebGL(support);
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: 440,
        background: 'var(--c-void)',
        color: 'var(--c-text-dim)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.9rem',
      }}>
        3D view requires WebGL — switch to Map tab
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '100%', minHeight: 440, borderRadius: 12, overflow: 'hidden', background: 'var(--c-void)' }}>
      <Viewer
        full
        selectionIndicator={false}
        infoBox={false}
        navigationHelpButton={false}
        geocoder={false}
        timeline={false}
        animation={false}
        baseLayerPicker={false}
        style={{ height: '100%', width: '100%' }}
      >
        <CameraFlyTo destination={Cartesian3.fromDegrees(loc.lng, loc.lat, 15000)} duration={0} />

        {activeNodes.map((node) => {
          // Color coding: red if BC > 0.7, amber if BC > 0.4, cyan otherwise
          let color = '#38bdf8';
          const bcVal = typeof node.bc === 'number' ? node.bc : 0;
          if (bcVal > 0.7) color = '#ef4444';
          else if (bcVal > 0.4) color = '#f59e0b';

          const lat = typeof node.lat === 'number' && !isNaN(node.lat) && isFinite(node.lat) ? node.lat : null;
          const lng = typeof node.lng === 'number' && !isNaN(node.lng) && isFinite(node.lng) ? node.lng : null;
          if (lat === null || lng === null) return null;

          return (
            <Entity
              key={node.id}
              name={node.name}
              position={Cartesian3.fromDegrees(lng, lat, 20)}
              billboard={{
                image: createPinSvg(color),
                width: 32,
                height: 32,
              }}
              onClick={() => setSelectedNode(node)}
            />
          );
        })}
      </Viewer>

      {/* Info Popup Overlay */}
      {selectedNode && (
        <div 
          className="glass-panel" 
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 1000,
            padding: 16,
            width: 280,
            background: 'rgba(13, 22, 48, 0.85)',
            border: '1px solid var(--c-border-bright)',
            borderRadius: 8,
            color: 'var(--c-text)',
          }}
        >
          <button 
            onClick={() => setSelectedNode(null)} 
            style={{ 
              float: 'right', 
              background: 'none', 
              border: 'none', 
              color: 'var(--c-text-dim)', 
              fontSize: '1rem', 
              cursor: 'pointer',
              marginTop: -4,
              marginRight: -4
            }}
          >
            ✕
          </button>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--c-cyan)', marginBottom: 8, borderBottom: '1px solid var(--c-border)', paddingBottom: 6 }}>
            {selectedNode.name}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
            <div>
              <span style={{ color: 'var(--c-text-dim)' }}>Betweenness: </span>
              <span style={{ color: selectedNode.bc > 0.7 ? 'var(--c-red)' : selectedNode.bc > 0.4 ? 'var(--c-amber)' : 'var(--c-cyan)', fontWeight: 'bold' }}>
                {typeof selectedNode.bc === 'number' ? selectedNode.bc.toFixed(3) : 'N/A'}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--c-text-dim)' }}>Road Type: </span>
              <span style={{ textTransform: 'capitalize', color: 'var(--c-green)', fontWeight: 600 }}>
                {selectedNode.road_type || 'N/A'}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--c-text-dim)' }}>Degree: </span>
              <span>{selectedNode.degree !== undefined ? `${selectedNode.degree} connections` : 'N/A'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--c-text-dim)' }}>Commuters: </span>
              <span>{typeof selectedNode.affected === 'number' ? selectedNode.affected.toLocaleString() : 'N/A'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
