import sys
import os
import numpy as np
import networkx as nx

# Add current folder to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pipeline import calculate_relaxed_iou, calculate_topological_accuracy, calculate_connectivity_ratio

def test_relaxed_iou():
    print("Testing Relaxed IoU...")
    gt = np.zeros((50, 50), dtype=np.uint8)
    gt[20:25, :] = 1  # horizontal road
    
    # 1. Exact match
    pred_exact = gt.copy()
    iou_strict = calculate_relaxed_iou(pred_exact, gt, buffer_px=0)
    iou_relaxed = calculate_relaxed_iou(pred_exact, gt, buffer_px=3)
    print(f"  Exact Match -> Strict IoU: {iou_strict:.4f}, Relaxed IoU: {iou_relaxed:.4f}")
    assert abs(iou_strict - 1.0) < 1e-5
    assert abs(iou_relaxed - 1.0) < 1e-5
    
    # 2. Shifted match (shifted by 2px)
    pred_shifted = np.zeros((50, 50), dtype=np.uint8)
    pred_shifted[22:27, :] = 1
    iou_strict_shifted = calculate_relaxed_iou(pred_shifted, gt, buffer_px=0)
    iou_relaxed_1px = calculate_relaxed_iou(pred_shifted, gt, buffer_px=1)
    iou_relaxed_3px = calculate_relaxed_iou(pred_shifted, gt, buffer_px=3)
    print(f"  Shifted 2px -> Strict IoU: {iou_strict_shifted:.4f}, 1px Relaxed: {iou_relaxed_1px:.4f}, 3px Relaxed: {iou_relaxed_3px:.4f}")
    assert iou_strict_shifted < 1.0
    assert iou_relaxed_3px > iou_strict_shifted
    print("[OK] Relaxed IoU test passed successfully!")

def test_topological_accuracy():
    print("\nTesting Topological Path Accuracy...")
    G_osm = nx.grid_2d_graph(4, 4)
    for u, v in G_osm.edges:
        G_osm[u][v]["weight"] = 10.0  # mock distance
        
    G_model = G_osm.copy()
    # Perturb weights slightly
    for u, v in G_model.edges:
        G_model[u][v]["weight"] = 10.0 * 1.05  # 5% constant error
        
    stats = calculate_topological_accuracy(G_model, G_osm, num_pairs=20)
    print(f"  Shortest Path Test Stats: {stats}")
    assert stats["pairs_tested"] > 0
    assert abs(stats["avg_error"] - 5.0) < 1.0
    print("[OK] Topological accuracy test passed successfully!")

def test_connectivity_ratio():
    print("\nTesting Connectivity Ratio post-healing...")
    G_before = nx.Graph()
    # Component A
    G_before.add_edge(1, 2)
    G_before.add_edge(2, 3)
    # Component B
    G_before.add_edge(4, 5)
    
    # Total nodes = 5
    # Largest component before is size 3 (fraction = 3/5 = 0.6)
    
    G_after = G_before.copy()
    # Heal: bridge node 3 and 4
    G_after.add_edge(3, 4)
    # Total nodes = 5
    # Largest component after is size 5 (fraction = 5/5 = 1.0)
    
    ratio = calculate_connectivity_ratio(G_before, G_after)
    expected_ratio = 1.0 / 0.6  # 1.667
    print(f"  Before healing: Largest CC size = 3")
    print(f"  After healing: Largest CC size = 5")
    print(f"  Connectivity Ratio: {ratio:.3f} (Expected: {expected_ratio:.3f})")
    assert abs(ratio - expected_ratio) < 0.05
    print("[OK] Connectivity ratio test passed successfully!")

if __name__ == "__main__":
    test_relaxed_iou()
    test_topological_accuracy()
    test_connectivity_ratio()
    print("\n=== ALL PIPELINE EVALUATION ALGORITHMS VERIFIED SUCCESSFULLY ===")
