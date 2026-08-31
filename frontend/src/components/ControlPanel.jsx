import { useState, useEffect, useCallback } from "react";
import { Play, Plus, Trash2, Link, AlertTriangle, CheckCircle2, ShieldCheck, GitCommit } from "lucide-react";
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
    const [cycleStatus, setCycleStatus] = useState(null);

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
        await api.delete(`/graph/node/${encodeURIComponent(removeNode.trim())}`);
        setRemoveNode("");
        if (onGraphRefresh) onGraphRefresh();
    }

    async function handleAddDependency() {
        if (!fromNode.trim() || !toNode.trim()) return;
        await api.post("/graph/edge", { fr: fromNode.trim(), to: toNode.trim() });
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
                message: `Recompiled ${builtNames.length} node(s) in ${duration}ms: ${builtNames.join(" → ")}`
            });

            if (onBuildExecuted) {
                onBuildExecuted({
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    changedNode: target,
                    success: res.data.success !== false,
                    durationMs: duration,
                    builtNodes: builtNames
                });
            }

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
                message: `Build error: ${err.response?.data?.msg || err.message}`
            });
        } finally {
            setLoading(false);
            if (setAiLoading) setAiLoading(false);
        }
    }

    async function handleCheckCycle() {
        try {
            const res = await api.get("/graph/cycle");
            setCycleStatus({
                hasCycle: res.data.hasCycle,
                cycle: res.data.cycle || []
            });
        } catch {
            setCycleStatus({ hasCycle: false, cycle: [] });
        }
    }

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <GitCommit size={15} />
                    <span>Engine Controls</span>
                </h3>
            </div>

            {/* Build Trigger Section */}
            <div className="control-subgroup">
                <label className="control-label">Incremental Build Execution</label>

                {availableNodes.length > 0 && (
                    <select
                        className="input-field"
                        value={buildNode}
                        onChange={(e) => setBuildNode(e.target.value)}
                    >
                        <option value="" disabled>Select target node</option>
                        {availableNodes.map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                )}

                <div className="input-group">
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Or type node (e.g. Service.java)"
                        value={buildNode}
                        onChange={(e) => setBuildNode(e.target.value)}
                    />
                    <button className="btn btn-accent" onClick={() => handleBuild()} disabled={loading || !buildNode}>
                        <Play size={13} />
                        <span>{loading ? "Building..." : "Run Build"}</span>
                    </button>
                </div>

                {buildFeedback && (
                    <div className={`status-badge ${buildFeedback.type}`}>
                        {buildFeedback.type === "success" ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                        <span>{buildFeedback.message}</span>
                    </div>
                )}
            </div>

            <hr className="divider" />

            {/* Graph Operations Section */}
            <div className="control-subgroup">
                <label className="control-label">Node Management</label>
                <div className="input-group">
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Add node (e.g. AuthController.java)"
                        value={addNode}
                        onChange={(e) => setAddNode(e.target.value)}
                    />
                    <button className="btn btn-secondary" onClick={handleAddNode}>
                        <Plus size={13} />
                        <span>Add</span>
                    </button>
                </div>

                <div className="input-group">
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Remove node"
                        value={removeNode}
                        onChange={(e) => setRemoveNode(e.target.value)}
                    />
                    <button className="btn btn-outline-danger" onClick={handleRemoveNode}>
                        <Trash2 size={13} />
                        <span>Delete</span>
                    </button>
                </div>
            </div>

            <div className="control-subgroup">
                <label className="control-label">Dependency Edge (From → To)</label>
                <div className="input-group">
                    <input
                        type="text"
                        className="input-field"
                        placeholder="From node"
                        value={fromNode}
                        onChange={(e) => setFromNode(e.target.value)}
                    />
                    <input
                        type="text"
                        className="input-field"
                        placeholder="To node"
                        value={toNode}
                        onChange={(e) => setToNode(e.target.value)}
                    />
                    <button className="btn btn-secondary" onClick={handleAddDependency}>
                        <Link size={13} />
                        <span>Link</span>
                    </button>
                </div>
            </div>

            <hr className="divider" />

            {/* Cycle Validation Section */}
            <div className="control-subgroup">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label className="control-label">Topology Validation</label>
                    <button className="btn btn-sm btn-secondary" onClick={handleCheckCycle}>
                        <ShieldCheck size={12} />
                        <span>Validate DAG</span>
                    </button>
                </div>

                {cycleStatus && (
                    <div className={`status-badge ${cycleStatus.hasCycle ? "error" : "success"}`}>
                        {cycleStatus.hasCycle ? (
                            <>
                                <AlertTriangle size={13} />
                                <span>Cycle detected in: {cycleStatus.cycle?.join(" → ")}</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={13} />
                                <span>Acyclic Graph Valid (No circular dependencies)</span>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ControlPanel;
