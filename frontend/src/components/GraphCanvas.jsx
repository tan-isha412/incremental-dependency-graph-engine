import ReactFlow, {
    Background,
    Controls,
    MiniMap
} from "reactflow";
import { useEffect, useState, useCallback } from "react";
import { Network, RefreshCw } from "lucide-react";
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

            const cols = Math.max(2, Math.ceil(Math.sqrt(rawNodes.length)));
            const flowNodes = rawNodes.map((node, index) => {
                const col = index % cols;
                const row = Math.floor(index / cols);
                return {
                    id: node.id,
                    position: {
                        x: col * 260 + 40,
                        y: row * 120 + 40
                    },
                    data: {
                        label: (
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                <div style={{ fontSize: "11px", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.04em" }}>Class</div>
                                <div style={{ fontSize: "13px", fontWeight: 600, color: "#f4f4f5", fontFamily: "var(--font-mono)" }}>
                                    {node.label || node.id}
                                </div>
                            </div>
                        )
                    },
                    style: {
                        background: "#18181b",
                        color: "#f4f4f5",
                        border: "1px solid #27272a",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        fontSize: "13px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        cursor: "pointer"
                    }
                };
            });

            const flowEdges = rawEdges.map((edge, index) => ({
                id: `e${index}`,
                source: edge.src || edge.fr,
                target: edge.target || edge.to,
                animated: true,
                style: { stroke: "#3b82f6", strokeWidth: 1.5 }
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
        <div className="card" style={{ height: "580px", width: "100%", position: "relative" }}>
            <div className="card-header">
                <h3 className="card-title">
                    <Network size={15} />
                    <span>Dependency Graph (AST View)</span>
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="badge badge-neutral">{nodes.length} nodes</span>
                    <button className="btn btn-sm btn-secondary" onClick={loadGraph}>
                        <RefreshCw size={11} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            <div style={{ width: "100%", height: "500px", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--border)", background: "#09090b" }}>
                <ReactFlow
    nodes={nodes}
    edges={edges}
    onNodeClick={handleNodeClick}
    fitView
    proOptions={{ hideAttribution: true }}
>
                    <Background color="#27272a" gap={20} size={1} />
                    <Controls style={{ fill: "#f4f4f5" }} showInteractive={false} />
                    <MiniMap
                        nodeColor={() => "#3b82f6"}
                        maskColor="rgba(9, 9, 11, 0.8)"
                        style={{ backgroundColor: "#18181b", border: "1px solid #27272a" }}
                    />
                </ReactFlow>
            </div>
        </div>
    );
}

export default GraphCanvas;
