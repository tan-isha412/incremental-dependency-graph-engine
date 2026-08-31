import { Zap, AlertTriangle, ShieldCheck, Check, Sparkles } from "lucide-react";

function AiImpactPanel({ impactReport, loading }) {
    if (loading) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <Zap size={15} />
                        <span>Blast-Radius & Impact Analysis</span>
                    </h3>
                </div>
                <div className="placeholder-box">
                    Computing downstream blast-radius and AST dependencies...
                </div>
            </div>
        );
    }

    if (!impactReport) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <Zap size={15} />
                        <span>Blast-Radius & Impact Analysis</span>
                    </h3>
                </div>
                <div className="placeholder-box">
                    Select a node or trigger a build to inspect downstream impact, affected tests, and reasoning.
                </div>
            </div>
        );
    }

    const getRiskBadge = (level) => {
        if (level === "HIGH") {
            return (
                <span className="badge badge-danger">
                    <AlertTriangle size={11} />
                    <span>HIGH RISK</span>
                </span>
            );
        }
        if (level === "MEDIUM") {
            return (
                <span className="badge badge-warning">
                    <AlertTriangle size={11} />
                    <span>MEDIUM RISK</span>
                </span>
            );
        }
        return (
            <span className="badge badge-success">
                <ShieldCheck size={11} />
                <span>LOW RISK</span>
            </span>
        );
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <Zap size={15} />
                    <span>Blast-Radius & Impact Analysis</span>
                </h3>
                {getRiskBadge(impactReport.riskLevel)}
            </div>

            <div className="impact-breakdown">
                <div className="impact-item">
                    <span className="impact-label">Target Modified Node</span>
                    <div className="code-tag highlight">{impactReport.changedFile}</div>
                </div>

                <div className="impact-item">
                    <span className="impact-label">Direct Dependents ({impactReport.directDependents?.length || 0})</span>
                    <div className="tag-container">
                        {impactReport.directDependents?.length > 0 ? (
                            impactReport.directDependents.map((d, i) => <span key={i} className="code-tag">{d}</span>)
                        ) : (
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>None</span>
                        )}
                    </div>
                </div>

                <div className="impact-item">
                    <span className="impact-label">Indirect Downstream ({impactReport.indirectDependents?.length || 0})</span>
                    <div className="tag-container">
                        {impactReport.indirectDependents?.length > 0 ? (
                            impactReport.indirectDependents.map((d, i) => <span key={i} className="code-tag">{d}</span>)
                        ) : (
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>None</span>
                        )}
                    </div>
                </div>

                <div className="impact-item">
                    <span className="impact-label">Recommended Test Suites ({impactReport.potentialTestsToRerun?.length || 0})</span>
                    <div className="tag-container">
                        {impactReport.potentialTestsToRerun?.length > 0 ? (
                            impactReport.potentialTestsToRerun.map((t, i) => <span key={i} className="code-tag test">{t}</span>)
                        ) : (
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>None</span>
                        )}
                    </div>
                </div>
            </div>

            {impactReport.unaffectedFiles && impactReport.unaffectedFiles.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="impact-label">Unaffected / Cached ({impactReport.unaffectedFiles.length} files preserved)</span>
                    <div className="tag-container">
                        {impactReport.unaffectedFiles.slice(0, 8).map((u, i) => (
                            <span key={i} className="code-tag clean">
                                <Check size={10} style={{ display: "inline", marginRight: "3px" }} />
                                {u}
                            </span>
                        ))}
                        {impactReport.unaffectedFiles.length > 8 && (
                            <span className="code-tag" style={{ color: "var(--text-muted)" }}>
                                +{impactReport.unaffectedFiles.length - 8} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            <div className="explanation-panel">
                <span className="explanation-title">
                    <Sparkles size={13} color="var(--accent)" />
                    <span>Contextual AST Impact Explanation</span>
                </span>
                <p className="explanation-text">{impactReport.aiExplanation}</p>
            </div>
        </div>
    );
}

export default AiImpactPanel;
