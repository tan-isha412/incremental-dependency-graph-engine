function MetricsPanel({ metrics }) {
    if (!metrics) {
        return (
            <div className="card metrics-card">
                <h2 className="panel-header"><span className="icon">📊</span> Build Performance Metrics</h2>
                <p className="placeholder-text">Run an incremental build to observe timing, topological order, and cache metrics.</p>
            </div>
        );
    }

    const buildTime = metrics.btime !== undefined ? metrics.btime : (metrics.buildTime || 0);
    const builtCount = metrics.builtNodes ? metrics.builtNodes.length : 0;
    const totalOrderCount = metrics.buildorder ? metrics.buildorder.length : 0;

    return (
        <div className="card metrics-card">
            <h2 className="panel-header"><span className="icon">📊</span> Build Performance Metrics</h2>

            <div className="metrics-grid">
                <div className="metric-box">
                    <span className="metric-label">Status</span>
                    <span className={metrics.success ? "badge badge-success" : "badge badge-danger"}>
                        {metrics.success ? "✓ SUCCESS" : "✕ FAILED"}
                    </span>
                </div>

                <div className="metric-box">
                    <span className="metric-label">Execution Time</span>
                    <span className="metric-value">{buildTime} ms</span>
                </div>

                <div className="metric-box">
                    <span className="metric-label">Rebuilt Subgraph</span>
                    <span className="metric-value highlight">{builtCount} nodes</span>
                </div>

                <div className="metric-box">
                    <span className="metric-label">Topological Order</span>
                    <span className="metric-value">{totalOrderCount} nodes</span>
                </div>
            </div>

            <div className="message-box">
                <strong>Log Message:</strong> {metrics.msg || metrics.message || "Build completed cleanly."}
            </div>

            {metrics.builtNodes && metrics.builtNodes.length > 0 && (
                <div className="built-nodes-list">
                    <strong>Rebuilt Nodes Sequence:</strong>
                    <div className="tag-list" style={{ marginTop: "6px" }}>
                        {metrics.builtNodes.map((n, i) => (
                            <span key={i} className="code-tag">{n.name || n} (v{n.version || 2})</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default MetricsPanel;
