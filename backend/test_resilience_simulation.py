import numpy as np
import cv2
import io
import os
import asyncio
import random
import networkx as nx
from fastapi import UploadFile

# Import main application handlers
from main import (
    root, 
    health, 
    fetch_osm_road_network, 
    run_simulation, 
    simulate_cascade, 
    segment_image, 
    SimulationRequest, 
    CascadeRequest, 
    GRAPH_CACHE
)


def test_health_check():
    """Verify that the health endpoints are responsive."""
    res_root = root()
    assert res_root["status"] == "online"

    res_health = health()
    assert res_health["status"] == "healthy"
    assert res_health["model"] == "unet_plus_swin_transformer"


def test_osm_road_network_fallback():
    """Verify that fetching the road network resolves to fallback data if API fails or with coordinates."""
    # Run the async handler directly
    res = asyncio.run(fetch_osm_road_network(lat=12.9177, lng=77.6228, radius_km=0.5))
    assert res["status"] == "success"
    assert "nodes" in res
    assert "geojson" in res
    assert len(res["nodes"]) > 0


def test_simulation_ablation_endpoints():
    """Test the simulate endpoint with baseline fallback and cached graph."""
    # Pre-populate graph cache to test real path computations
    G = nx.grid_2d_graph(4, 4)
    # Relabel nodes to integers
    mapping = {node: idx for idx, node in enumerate(G.nodes)}
    G = nx.relabel_nodes(G, mapping)
    for u, v in G.edges:
        G[u][v]["weight"] = 1.2
    
    # Calculate betweenness centrality
    bc = nx.betweenness_centrality(G, weight="weight")
    nx.set_node_attributes(G, bc, "betweenness")
    bc_dict: dict = bc
    
    formatted_nodes = []
    for idx, node in enumerate(list(G.nodes)[:8]):
        formatted_nodes.append({
            "id": idx,
            "node_id": str(node),
            "name": f"Junction {idx + 1}",
            "lat": 12.9177 + idx * 0.002,
            "lng": 77.6228 + idx * 0.002,
            "bc": bc_dict[node],
            "degree": G.degree(node),
            "affected": G.degree(node) * 8500,
            "risk": "MEDIUM"
        })
        
    GRAPH_CACHE["graph"] = G
    GRAPH_CACHE["nodes"] = formatted_nodes

    # Test API simulate endpoint handler
    req = SimulationRequest(disabled_node_ids=[0, 2], scenario="flood")
    res = run_simulation(req)
    assert res["scenario"] == "flood"
    assert "resilience_curve" in res
    assert len(res["resilience_curve"]) == 15
    assert res["resilience_curve"][0]["R"] == 1.0  # Step 0 is baseline
    assert res["risk_level"] in ["STABLE", "DEGRADED", "CRITICAL"]


def test_cascade_failure_simulation():
    """Verify that cascade failure propagates properly on a cached graph."""
    # Rely on the populated cache from the previous test
    req = CascadeRequest(trigger_node_id=0, max_cascade_depth=3)
    res = simulate_cascade(req)
    assert "failures" in res
    assert len(res["failures"]) > 0
    assert res["failures"][0]["step"] == 0  # Trigger failure step is 0
    assert res["failures"][0]["node_id"] == 0


def test_segmentation_pipeline_endpoint():
    """Verify that the segmentation endpoint correctly preprocesses, skeletonizes, and heals image data."""
    # Create a dummy RGB image
    img = np.zeros((512, 512, 3), dtype=np.uint8)
    # Draw two intersecting white lines simulating roads
    cv2.line(img, (0, 256), (512, 256), (255, 255, 255), 5)
    cv2.line(img, (256, 0), (256, 512), (255, 255, 255), 5)
    
    # Encode to PNG bytes
    is_success, buffer = cv2.imencode(".png", img)
    io_buf = io.BytesIO(buffer.tobytes())

    # Wrap in Starlette UploadFile
    upload_file = UploadFile(filename="test_tile.png", file=io_buf)

    # Run the async handler directly
    res = asyncio.run(segment_image(upload_file))
    assert res["status"] == "success"
    assert "metrics" in res
    assert "graph" in res
    assert res["metrics"]["road_pixels"] > 0
    assert res["graph"]["nodes"] > 0
    assert res["graph"]["connectivity_ratio"] >= 1.0


if __name__ == "__main__":
    print("Running automated test suite for RouteResilience...")
    try:
        test_health_check()
        print("[OK] test_health_check passed.")
        test_osm_road_network_fallback()
        print("[OK] test_osm_road_network_fallback passed.")
        test_simulation_ablation_endpoints()
        print("[OK] test_simulation_ablation_endpoints passed.")
        test_cascade_failure_simulation()
        print("[OK] test_cascade_failure_simulation passed.")
        test_segmentation_pipeline_endpoint()
        print("[OK] test_segmentation_pipeline_endpoint passed.")
        print("\n=== ALL TEST CASES COMPLETED SUCCESSFULLY ===")
    except AssertionError as e:
        print(f"\n[FAIL] Test assertion failed: {e}")
        import sys
        sys.exit(1)
    except Exception as e:
        print(f"\n[FAIL] Test encountered unexpected error: {e}")
        import sys
        sys.exit(1)
