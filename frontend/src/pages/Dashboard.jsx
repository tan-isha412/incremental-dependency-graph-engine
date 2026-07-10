import ControlPanel from "../components/ControlPanel";
import GraphCanvas from "../components/GraphCanvas";
import MetricsPanel from "../components/MetricsPanel";
import 'C:/Users/tanis/OneDrive/Desktop/SEM-IV/projects_resume/incremental_dependency_graph_engine/frontend/src/dashboard.css'
function Dashboard() 
{
    const [metrics, setMetrics] = useState(null);
    return (
        <div className="dashboard">
            <h1 className="heading">
                Incremental Dependency Graph Engine
            </h1>
            <div className="sec">
            <div className="top-sec">
            <ControlPanel setMetrics={setMetrics}/>
            <GraphCanvas />
            </div>
            <div className="down-sec">
            <MetricsPanel metrics={metrics}/>
            </div>
            </div>
        </div>
    );
}

export default Dashboard;