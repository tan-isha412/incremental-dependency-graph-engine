import { useState } from "react";
import ProjectPicker from "../components/ProjectPicker";
import ControlPanel from "../components/ControlPanel";
import GraphCanvas from "../components/GraphCanvas";
import MetricsPanel from "../components/MetricsPanel";
import AiImpactPanel from "../components/AiImpactPanel";
import BuildHistoryPanel from "../components/BuildHistoryPanel";
import "../dashboard.css";

function Dashboard() {
    const [metrics, setMetrics] = useState(null);
    const [impactReport, setImpactReport] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [graphRefreshTrigger, setGraphRefreshTrigger] = useState(0);
    const [buildHistory, setBuildHistory] = useState([]);

    const [selectedNode, setSelectedNode] = useState("");

    const handleGraphRefresh = () => {
        setGraphRefreshTrigger(prev => prev + 1);
    };

    const handleBuildExecuted = (buildItem) => {
        setBuildHistory(prev => [buildItem, ...prev]);
    };

    const handleScanComplete = () => {
        handleGraphRefresh();
    };

    return (
        <div className="dashboard-container">
            <header className="main-header">
                <h1 className="main-title">
                    <span>⚡</span> AI-Powered Incremental Build Intelligence Platform
                </h1>
                <p className="main-subtitle">
                    Static AST Analysis (JavaParser) · Deterministic DAG Engine · Knowledge Graph · GenAI Impact Reasoning
                </p>
            </header>

            <div className="grid-top">
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <ProjectPicker
                        onScanComplete={handleScanComplete}
                        onFileWatchTriggered={handleGraphRefresh}
                    />
                    <ControlPanel
                        setMetrics={setMetrics}
                        onGraphRefresh={handleGraphRefresh}
                        setImpactReport={setImpactReport}
                        setAiLoading={setAiLoading}
                        onBuildExecuted={handleBuildExecuted}
                        selectedNode={selectedNode}
                        graphRefreshTrigger={graphRefreshTrigger}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <GraphCanvas
                        refreshTrigger={graphRefreshTrigger}
                        onNodeSelect={(nodeId) => setSelectedNode(nodeId)}
                    />
                </div>
            </div>

            <div className="grid-bottom">
                <MetricsPanel metrics={metrics} />
                <AiImpactPanel impactReport={impactReport} loading={aiLoading} />
            </div>

            <div style={{ marginTop: "20px" }}>
                <BuildHistoryPanel history={buildHistory} />
            </div>
        </div>
    );
}

export default Dashboard;
