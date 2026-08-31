import { History, CheckCircle2, XCircle, Clock } from "lucide-react";

function BuildHistoryPanel({ history = [] }) {
    if (!history || history.length === 0) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <History size={15} />
                        <span>Execution Audit Log</span>
                    </h3>
                </div>
                <div className="placeholder-box">
                    No execution events recorded in current session.
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <History size={15} />
                    <span>Execution Audit Log</span>
                </h3>
                <span className="badge badge-neutral">{history.length} records</span>
            </div>

            <div className="history-table">
                {history.map((item, idx) => (
                    <div key={idx} className="history-row">
                        <div className="history-top">
                            <span className="history-timestamp">
                                <Clock size={11} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} />
                                {item.timestamp}
                            </span>
                            <span className={item.success ? "badge badge-success" : "badge badge-danger"}>
                                {item.success ? (
                                    <>
                                        <CheckCircle2 size={10} />
                                        <span>PASSED ({item.durationMs}ms)</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle size={10} />
                                        <span>FAILED ({item.durationMs}ms)</span>
                                    </>
                                )}
                            </span>
                        </div>
                        <div className="history-body">
                            <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>Trigger:</span>
                            <span className="code-tag">{item.changedNode}</span>
                            <span style={{ color: "var(--text-muted)", margin: "0 4px" }}>•</span>
                            <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                                Rebuilt: {item.builtNodes?.length || 0} nodes ({item.builtNodes?.map(n => typeof n === "string" ? n : n.name || n).join(" → ") || "none"})
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BuildHistoryPanel;
