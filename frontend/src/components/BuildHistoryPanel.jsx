function BuildHistoryPanel({ history = [] }) {
    if (!history || history.length === 0) {
        return (
            <div className="card history-card">
                <h3 className="section-title"><span className="icon">📜</span> Incremental Build History</h3>
                <p className="placeholder-text">No incremental build executions logged yet.</p>
            </div>
        );
    }

    return (
        <div className="card history-card">
            <h3 className="section-title"><span className="icon">📜</span> Incremental Build History</h3>
            <div className="history-list">
                {history.map((item, idx) => (
                    <div key={idx} className="history-item">
                        <div className="history-header">
                            <span className="history-time">{item.timestamp}</span>
                            <span className={item.success ? "badge badge-success" : "badge badge-danger"}>
                                {item.success ? "SUCCESS" : "FAILED"} ({item.durationMs}ms)
                            </span>
                        </div>
                        <div className="history-details">
                            <strong>Trigger Node:</strong> <span className="code-tag">{item.changedNode}</span>
                            <div className="history-built">
                                <strong>Built Subgraph ({item.builtNodes?.length || 0}):</strong>{" "}
                                {item.builtNodes?.map(n => n.name || n).join(", ") || "None"}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BuildHistoryPanel;
