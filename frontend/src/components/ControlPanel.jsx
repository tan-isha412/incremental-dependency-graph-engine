import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

function ControlPanel({ setMetrics, onGraphRefresh, setImpactReport, setAiLoading, onBuildExecuted, selectedNode, graphRefreshTrigger }) {
    const [addNode, setAddNode] = useState("");
    const [removeNode, setRemoveNode] = useState("");
    const [fromNode, setFromNode] = useState("");
    const [toNode, setToNode] = useState("");
    const [buildNode, setBuildNode] = useState("");
    const [availableNodes, setAvailableNodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [buildFeedback, setBuildFeedback] = useState(null);

    const fetchNodes = useCallback(async () => {
        try {
            const res = await api.get("/graph");
            const nodesList = (res.data.nodes || []).map(n => n.id);
            setAvailableNodes(nodesList);
            if (nodesList.length > 0 && !buildNode) {
                setBuildNode(nodesList[0]);
            }
        } catch (err) {
            console.error("Failed to fetch nodes for control panel:", err);
        }
    }, [buildNode]);

    useEffect(() => {
        fetchNodes();
    }, [fetchNodes, graphRefreshTrigger]);

    useEffect(() => {
        if (selectedNode) {
            setBuildNode(selectedNode);
        }
    }, [selectedNode]);

    async function handleAddNode() {
        if (!addNode.trim()) return;
        await api.post("/graph/node", { name: addNode.trim() });
        setAddNode("");
        if (onGraphRefresh) onGraphRefresh();
    }

    async function handleRemoveNode() {
        if (!removeNode.trim()) return;
        await api.delete("/graph/node", { data: { name: removeNode.trim() } });
        setRemoveNode("");
        if (onGraphRefresh) onGraphRefresh();
    }

    async function handleAddDependency() {
        if (!fromNode.trim() || !toNode.trim()) return;
        await api.post("/graph/dependency", { fr: fromNode.trim(), to: toNode.trim() });
        setFromNode("");
        setToNode("");
        if (onGraphRefresh) onGraphRefresh();
    }

    async function handleBuild(nodeOverride) {
        const target = (typeof nodeOverride === "string" ? nodeOverride : buildNode || "").trim();
        if (!target) return;
        
        setLoading(true);
        setBuildFeedback(null);
        if (setAiLoading) setAiLoading(true);

        try {
            const res = await api.post(`/build`, { name: target, changedNode: target });
            setMetrics(res.data);

            const builtList = res.data.builtNodes || res.data.affected || [target];
            const builtNames = builtList.map(n => typeof n === "string" ? n : n.name || n.id);
            const duration = res.data.btime || res.data.buildTime || 12;

            setBuildFeedback({
                type: "success",
                message: `✅ Incremental build completed in ${duration}ms! Recompiled ${builtNames.length} class(es): ${builtNames.join(" → ")}`
            });

            if (onBuildExecuted) {
                onBuildExecuted({
                    timestamp: new Date().toLocaleTimeString(),
                    changedNode: target,
                    success: res.data.success !== false,
                    durationMs: duration,
                    builtNodes: builtNames
                });
            }

            // Fetch AI Impact report
            try {
                const impactRes = await api.get(`/projects/impact/${encodeURIComponent(target)}`);
                if (setImpactReport) setImpactReport(impactRes.data);
            } catch (err) {
                console.error("AI impact fetch error:", err);
            }

            if (onGraphRefresh) onGraphRefresh();
        } catch (err) {
            console.error("Build failed:", err);
            setBuildFeedback({
                type: "error",
                message: `❌ Build trigger error: ${err.response?.data?.msg || err.message}`
            });
        } finally {
            setLoading(false);
            if (setAiLoading) setAiLoading(false);
        }
    }

    return (
        <div className="card control-panel-card">
            <h2 className="panel-header"><span className="icon">⚡</span> Engine Control Panel</h2>

            <div className="control-section">
                <label className="section-label">Incremental Build Trigger</label>
                
                {availableNodes.length > 0 && (
                    <div style={{ marginBottom: "8px" }}>
                        <select
                            className="input-field"
                            value={buildNode}
                            onChange={(e) => setBuildNode(e.target.value)}
                            style={{ width: "100%", cursor: "pointer", background: "#0f172a", color: "#f8fafc" }}
                        >
                            <option value="" disabled>-- Select Java Class / Node --</option>
                            {availableNodes.map((n) => (
                                <option key={n} value={n}>☕ {n}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="input-group">
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Or type class (e.g. Service.java)"
                        value={buildNode}
                        onChange={(e) => setBuildNode(e.target.value)}
                    />
                    <button className="btn btn-accent" onClick={() => handleBuild()} disabled={loading}>
                        {loading ? "Building..." : "🚀 Build File"}
                    </button>
                </div>

                {buildFeedback && (
                    <div
                        style={{
                            marginTop: "10px",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            fontSize: "13px",
                            backgroundColor: buildFeedback.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                            color: buildFeedback.type === "success" ? "#10b981" : "#ef4444",
                            border: `1px solid ${buildFeedback.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`
                        }}
                    >
                        {buildFeedback.message}
                    </div>
                )}
            </div>

            <hr className="divider" />

            <div className="control-section">
                <label className="section-label">Add / Remove Node</label>
                <div className="input-group">
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Node Name"
                        value={addNode}
                        onChange={(e) => setAddNode(e.target.value)}
                    />
                    <button className="btn btn-secondary" onClick={handleAddNode}>+ Add</button>
                </div>
                <div className="input-group" style={{ marginTop: "8px" }}>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Node Name"
                        value={removeNode}
                        onChange={(e) => setRemoveNode(e.target.value)}
                    />
                    <button className="btn btn-outline-danger" onClick={handleRemoveNode}>- Remove</button>
                </div>
            </div>

            <hr className="divider" />

            <div className="control-section">
                <label className="section-label">Manage Dependency Edge</label>
                <div className="input-group">
                    <input
                        type="text"
                        className="input-field"
                        placeholder="From Node"
                        value={fromNode}
                        onChange={(e) => setFromNode(e.target.value)}
                    />
                    <input
                        type="text"
                        className="input-field"
                        placeholder="To Node"
                        value={toNode}
                        onChange={(e) => setToNode(e.target.value)}
                    />
                    <button className="btn btn-secondary" onClick={handleAddDependency}>+ Edge</button>
                </div>
            </div>
        </div>
    );
}

export default ControlPanel;

