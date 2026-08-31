function AiImpactPanel({ impactReport, loading }) {
    if (loading) {
        return (
            <div className="card ai-impact-card">
                <h3 className="section-title"><span className="icon">🤖</span> AI Build Impact Analysis</h3>
                <p>Generating GenAI impact report & AST dependency reasoning...</p>
            </div>
        );
    }

    if (!impactReport) {
        return (
            <div className="card ai-impact-card">
                <h3 className="section-title"><span className="icon">🤖</span> AI Build Impact Analysis</h3>
                <p className="placeholder-text">Select a node or trigger an incremental build to inspect AI impact explanation and recommended tests.</p>
            </div>
        );
    }

    const getRiskClass = (level) => {
        if (level === "HIGH") return "badge badge-danger";
        if (level === "MEDIUM") return "badge badge-warning";
        return "badge badge-success";
    };

    return (
        <div className="card ai-impact-card">
            <div className="card-header">
                <h3 className="section-title"><span className="icon">🤖</span> AI Build Impact Analysis</h3>
                <span className={getRiskClass(impactReport.riskLevel)}>
                    {impactReport.riskLevel} RISK
                </span>
            </div>

            <div className="impact-grid">
                <div className="impact-box">
                    <strong>Modified File:</strong>
                    <div className="code-tag highlight">{impactReport.changedFile}</div>
                </div>

                <div className="impact-box">
                    <strong>Direct Dependents ({impactReport.directDependents?.length || 0}):</strong>
                    <div className="tag-list">
                        {impactReport.directDependents?.length > 0
                            ? impactReport.directDependents.map((d, i) => <span key={i} className="code-tag">{d}</span>)
                            : <span className="muted">None</span>}
                    </div>
                </div>

                <div className="impact-box">
                    <strong>Indirect Downstream ({impactReport.indirectDependents?.length || 0}):</strong>
                    <div className="tag-list">
                        {impactReport.indirectDependents?.length > 0
                            ? impactReport.indirectDependents.map((d, i) => <span key={i} className="code-tag muted-tag">{d}</span>)
                            : <span className="muted">None</span>}
                    </div>
                </div>

                <div className="impact-box">
                    <strong>Suggested Tests to Rerun ({impactReport.potentialTestsToRerun?.length || 0}):</strong>
                    <div className="tag-list">
                        {impactReport.potentialTestsToRerun?.length > 0
                            ? impactReport.potentialTestsToRerun.map((t, i) => <span key={i} className="code-tag test-tag">🧪 {t}</span>)
                            : <span className="muted">None</span>}
                    </div>
                </div>

                <div className="impact-box">
                    <strong>Unaffected Files Saved ({impactReport.unaffectedFiles?.length || 0}):</strong>
                    <div className="tag-list">
                        {impactReport.unaffectedFiles?.length > 0
                            ? impactReport.unaffectedFiles.map((u, i) => <span key={i} className="code-tag clean-tag">✓ {u}</span>)
                            : <span className="muted">None</span>}
                    </div>
                </div>
            </div>

            <div className="reasoning-box">
                <h4>GenAI Contextual Reasoning & AST Explanation</h4>
                <p>{impactReport.aiExplanation}</p>
            </div>
        </div>
    );
}

export default AiImpactPanel;
