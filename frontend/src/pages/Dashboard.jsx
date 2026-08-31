import { useState } from "react";
import { Cpu, Activity, RefreshCw } from "lucide-react";
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
        <div className="dashboard-wrapper">
            <header className="top-navbar">
                <div className="brand-section">
                    <div className="brand-logo">
                        <Cpu size={16} />
                    </div>
                    <h1 className="brand-title">Build Intelligence Engine</h1>
                    <span className="brand-badge">AST DAG</span>
                </div>
                <div className="navbar-actions">
                    <div className="engine-status">
                        <span className="status-dot"></span>
                        <span>Engine Ready</span>
                    </div>
                    <button
                        className="btn btn-sm btn-secondary"
                        onClick={handleGraphRefresh}
                        title="Reload Graph"
                    >
                        <RefreshCw size={12} />
                        <span>Sync</span>
                    </button>
                </div>
            </header>

            <main className="dashboard-container">
                <div className="grid-main">
                    <div className="sidebar-column">
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

                    <div className="canvas-column">
                        <GraphCanvas
                            refreshTrigger={graphRefreshTrigger}
                            onNodeSelect={(nodeId) => setSelectedNode(nodeId)}
                        />
                    </div>
                </div>

                <div className="grid-secondary">
                    <MetricsPanel metrics={metrics} />
                    <AiImpactPanel impactReport={impactReport} loading={aiLoading} />
                </div>

                <div className="history-section">
                    <BuildHistoryPanel history={buildHistory} />
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
