import { BarChart3, CheckCircle2, XCircle, Clock } from "lucide-react";

function MetricsPanel({ metrics }) {
    if (!metrics) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <BarChart3 size={15} />
                        <span>Build Performance Metrics</span>
                    </h3>
                </div>
                <div className="placeholder-box">
                    Execute an incremental build to observe duration, topological order, and recompilation sequence.
                </div>
            </div>
        );
    }

    const buildTime = metrics.btime !== undefined ? metrics.btime : (metrics.buildTime || 0);
    const builtCount = metrics.builtNodes ? metrics.builtNodes.length : 0;
    const totalOrderCount = metrics.buildorder ? metrics.buildorder.length : 0;

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <BarChart3 size={15} />
                    <span>Build Performance Metrics</span>
                </h3>
                <span className={metrics.success ? "badge badge-success" : "badge badge-danger"}>
                    {metrics.success ? (
                        <>
                            <CheckCircle2 size={11} />
                            <span>PASSED</span>
                        </>
                    ) : (
                        <>
                            <XCircle size={11} />
                            <span>FAILED</span>
                        </>
                    )}
                </span>
            </div>

            <div className="metrics-grid">
                <div className="metric-card">
                    <span className="metric-name">Duration</span>
                    <span className="metric-num">{buildTime} ms</span>
                </div>

                <div className="metric-card">
                    <span className="metric-name">Rebuilt Nodes</span>
                    <span className="metric-num" style={{ color: "var(--accent)" }}>{builtCount}</span>
                </div>

                <div className="metric-card">
                    <span className="metric-name">Topological Nodes</span>
                    <span className="metric-num">{totalOrderCount}</span>
                </div>

                <div className="metric-card">
                    <span className="metric-name">Cache Strategy</span>
                    <span className="metric-num" style={{ fontSize: "14px", color: "var(--success)" }}>Incremental</span>
                </div>
            </div>

            <div className="status-badge" style={{ marginTop: "4px" }}>
                <span>Log:</span> {metrics.msg || metrics.message || "Build execution complete."}
            </div>

            {metrics.builtNodes && metrics.builtNodes.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="control-label">Rebuilt Topological Sequence</span>
                    <div className="tag-container">
                        {metrics.builtNodes.map((n, i) => (
                            <span key={i} className="code-tag highlight">
                                {n.name || n} <span style={{ opacity: 0.6 }}>(v{n.version || 2})</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default MetricsPanel;
