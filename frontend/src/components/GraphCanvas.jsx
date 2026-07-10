import ReactFlow, {
    Background,
    Controls,
    MiniMap
} from "reactflow";

import { useEffect, useState } from "react";
import api from "../services/api";

import "reactflow/dist/style.css";

function GraphCanvas() {

    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    async function loadGraph() {

        try {

            const res = await api.get("/graph");

            const flowNodes = res.data.nodes.map((node, index) => ({
                id: node.id,
                position: {
                    x: 100,
                    y: index * 120 + 50
                },
                data: {
                    label: node.label
                }
            }));

            const flowEdges = res.data.edges.map((edge, index) => ({
                id: `e${index}`,
                source: edge.fr,
                target: edge.to
            }));

            setNodes(flowNodes);
            setEdges(flowEdges);

        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        loadGraph();
    }, []);

    return (
        <div
            style={{
                width: "800px",
                height: "650px",
                border: "2px solid white",
                borderRadius: "10px"
            }}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
            >
                <Background />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
}

export default GraphCanvas;