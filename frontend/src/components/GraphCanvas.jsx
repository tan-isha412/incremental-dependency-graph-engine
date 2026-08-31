import ReactFlow, {
    Background,
    Controls,
    MiniMap
} from "reactflow";
import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import "reactflow/dist/style.css";

function GraphCanvas({ refreshTrigger, onNodeSelect }) {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    const loadGraph = useCallback(async () => {
        try {
            const res = await api.get("/graph");
            const rawNodes = res.data.nodes || [];
            const rawEdges = res.data.edges || [];

            const cols = 3;
            const flowNodes = rawNodes.map((node, index) => {
                const col = index % cols;
                const row = Math.floor(index / cols);
                return {
                    id: node.id,
                    position: {
                        x: col * 240 + 50,
                        y: row * 130 + 50
                    },
                    data: {
                        label: `☕ ${node.label || node.id}`
                    },
                    style: {
                        background: "#1f2430",
                        color: "#e6edf3",
                        border: "1px solid #38bdf8",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        fontWeight: 600,
                        fontSize: "13px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                    }
                };
            });

            const flowEdges = rawEdges.map((edge, index) => ({
                id: `e${index}`,
                source: edge.src || edge.fr,
                target: edge.target || edge.to,
                animated: true,
                style: { stroke: "#a855f7", strokeWidth: 2 }
            }));

            setNodes(flowNodes);
            setEdges(flowEdges);

        } catch (err) {
            console.error("Error loading dependency graph:", err);
        }
    }, []);

    useEffect(() => {
        loadGraph();
    }, [loadGraph, refreshTrigger]);

    const handleNodeClick = (_, node) => {
        if (onNodeSelect) {
            onNodeSelect(node.id);
        }
    };

    return (
        <div className="card canvas-card" style={{ height: "560px", width: "100%", position: "relative" }}>
            <div className="canvas-header">
                <h3><span className="icon">🕸️</span> Live Dependency Graph (AST Visualizer)</h3>
                <button className="btn btn-sm btn-secondary" onClick={loadGraph}>🔄 Refresh</button>
            </div>
            <div style={{ width: "100%", height: "500px", borderRadius: "8px", overflow: "hidden" }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodeClick={handleNodeClick}
                    fitView
                >
                    <Background color="#334155" gap={16} />
                    <Controls />
                    <MiniMap
                        nodeColor={() => "#38bdf8"}
                        maskColor="rgba(15, 23, 42, 0.7)"
                        style={{ backgroundColor: "#0f172a" }}
                    />
                </ReactFlow>
            </div>
        </div>
    );
}

export default GraphCanvas;
