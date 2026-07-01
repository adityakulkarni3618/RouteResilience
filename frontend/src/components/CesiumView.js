import React, { useState, useEffect, useRef } from 'react';
import { getShiftedNodes, getActiveLocation } from '../utils/locationHelper';

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

export default function CesiumView({ activeLoc, customNodes, activeGeoJSON }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);

  const loc = activeLoc || getActiveLocation();
  const activeNodes = customNodes || getShiftedNodes(CITY_NODES);

  useEffect(() => {
    if (!window.Cesium) {
      console.error("Cesium is not loaded via CDN.");
      return;
    }

    // Set Cesium Ion token
    window.Cesium.Ion.defaultAccessToken = window.CESIUM_ION_TOKEN || '';

    // Set base URL to CDN
    window.CESIUM_BASE_URL = 'https://unpkg.com/cesium@1.115.0/Build/Cesium/';

    // Dynamically load Cesium CSS from CDN
    if (!document.getElementById('cesium-css')) {
      const link = document.createElement('link');
      link.id = 'cesium-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/cesium@1.115.0/Build/Cesium/Widgets/widgets.css';
      document.head.appendChild(link);
    }

    // Initialize Viewer
    const viewer = new window.Cesium.Viewer(containerRef.current, {
      selectionIndicator: false,
      infoBox: false,
      navigationHelpButton: false,
      geocoder: false,
      timeline: false,
      animation: false,
      baseLayerPicker: false,
    });
    viewerRef.current = viewer;
    setLoading(false);

    // Click handler for entity selection
    const handler = new window.Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click) => {
      const pickedObject = viewer.scene.pick(click.position);
      if (window.Cesium.defined(pickedObject) && pickedObject.id) {
        const entity = pickedObject.id;
        if (entity.properties) {
          const nodeProps = {};
          entity.properties.propertyNames.forEach(name => {
            const propVal = entity.properties[name];
            nodeProps[name] = (propVal && typeof propVal.getValue === 'function') ? propVal.getValue() : propVal;
          });
          setSelectedNode(nodeProps);
        }
      } else {
        setSelectedNode(null);
      }
    }, window.Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  // Update position / fly to location when activeLoc changes
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !window.Cesium) return;

    viewer.camera.flyTo({
      destination: window.Cesium.Cartesian3.fromDegrees(loc.lng, loc.lat, 15000),
      duration: 0,
    });
  }, [loc.lat, loc.lng]);

  // Update nodes and GeoJSON when they change
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !window.Cesium) return;

    // Clear previous entities and data sources
    viewer.entities.removeAll();
    viewer.dataSources.removeAll();

    // Add node pins
    activeNodes.forEach((node) => {
      const bcVal = typeof node.bc === 'number' ? node.bc : typeof node.betweenness === 'number' ? node.betweenness : 0;
      let colorVal = window.Cesium.Color.CYAN;
      if (bcVal > 0.7) colorVal = window.Cesium.Color.RED;
      else if (bcVal > 0.4) colorVal = window.Cesium.Color.ORANGE;

      const lat = typeof node.lat === 'number' && !isNaN(node.lat) && isFinite(node.lat) ? node.lat : null;
      const lng = typeof node.lng === 'number' && !isNaN(node.lng) && isFinite(node.lng) ? node.lng : null;
      if (lat === null || lng === null) return;

      viewer.entities.add({
        name: node.name,
        position: window.Cesium.Cesium3DTileset ? window.Cesium.Cartesian3.fromDegrees(lng, lat, 20) : window.Cesium.Cartesian3.fromDegrees(lng, lat, 20),
        point: {
          pixelSize: 12,
          color: colorVal,
          outlineColor: window.Cesium.Color.WHITE,
          outlineWidth: 2,
        },
        properties: node,
      });
    });

    // Load GeoJSON
    if (activeGeoJSON) {
      window.Cesium.GeoJsonDataSource.load(activeGeoJSON).then((dataSource) => {
        viewer.dataSources.add(dataSource);
        const entities = dataSource.entities.values;
        entities.forEach((entity) => {
          const feature = entity.properties;
          if (!feature) return;

          const getValue = (propName) => {
            const val = feature[propName];
            return (val && typeof val.getValue === 'function') ? val.getValue() : val;
          };

          const betweenness = getValue('betweenness') ?? 0.5;
          const isBroken = !!getValue('broken');
          const isHealed = !!getValue('healed');

          let colorVal = window.Cesium.Color.CYAN;
          if (isBroken) {
            colorVal = window.Cesium.Color.RED;
          } else if (isHealed) {
            colorVal = window.Cesium.Color.fromCssString('#a78bfa');
          } else if (betweenness > 0.7) {
            colorVal = window.Cesium.Color.RED;
          } else if (betweenness > 0.4) {
            colorVal = window.Cesium.Color.ORANGE;
          }

          if (entity.polyline) {
            entity.polyline.material = colorVal;
            entity.polyline.width = isBroken ? 2.0 : 3.5;
          }
        });
      });
    }
  }, [activeNodes, activeGeoJSON]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 440, borderRadius: 12, overflow: 'hidden', background: 'var(--c-void)' }}>
      {loading && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: 'var(--c-text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem',
          background: 'rgba(2, 4, 10, 0.85)'
        }}>
          <div style={{
            width: 40, height: 40, border: '2px solid rgba(0, 229, 255, 0.2)',
            borderTopColor: 'var(--c-cyan)', borderRadius: '50%',
            animation: 'spin-slow 1s linear infinite', marginBottom: 12
          }} />
          Initializing 3D Globe View...
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

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
                {typeof selectedNode.bc === 'number' ? selectedNode.bc.toFixed(3) : typeof selectedNode.betweenness === 'number' ? selectedNode.betweenness.toFixed(3) : 'N/A'}
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
