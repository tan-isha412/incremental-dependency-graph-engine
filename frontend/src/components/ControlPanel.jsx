import { useState } from "react";
import api from "../services/api";
function ControlPanel({ setMetrics }) {

    const [addNode, setAddNode] = useState("");
    const [removeNode, setRemoveNode] = useState("");

    const [fromNode, setFromNode] = useState("");
    const [toNode, setToNode] = useState("");

    const [removeFromNode, setRemoveFromNode] = useState("");
    const [removeToNode, setRemoveToNode] = useState("");

    const [buildNode, setBuildNode] = useState("");

    async function handleAddNode() {
        await api.post("/graph/node", {name: addNode});
    }

    async function handleRemoveNode() {
        await api.delete("/graph/node", {data:{name: removeNode}});
    }

    async function handleAddDependency() {
        await api.post("/graph/dependency",{fr:fromNode,to:toNode});
    }

    async function handleRemoveDependency() {
        await api.delete("/graph/dependency",{data:{fr:removeFromNode,to:removeToNode}});
    }

    async function handleBuild() {
        const res = await api.post("/build", {
        changedNode: buildNode});
        setMetrics(res.data);
    }

    return (
        <div className="cpanel">

            <h2>Node Operations</h2>

            <input
                type="text"
                placeholder="Node Name"
                value={addNode}
                onChange={(e) => setAddNode(e.target.value)}
            />

            <button onClick={handleAddNode}>
                Add Node
            </button>

            <br /><br />

            <input
                type="text"
                placeholder="Node Name"
                value={removeNode}
                onChange={(e) => setRemoveNode(e.target.value)}
            />

            <button onClick={handleRemoveNode}>
                Remove Node
            </button>

            <hr />

            <h2>Add Dependency</h2>

            <input
                type="text"
                placeholder="From"
                value={fromNode}
                onChange={(e) => setFromNode(e.target.value)}
            />

            <input
                type="text"
                placeholder="To"
                value={toNode}
                onChange={(e) => setToNode(e.target.value)}
            />

            <button onClick={handleAddDependency}>
                Add Dependency
            </button>

            <hr />

            <h2>Remove Dependency</h2>

            <input
                type="text"
                placeholder="From"
                value={removeFromNode}
                onChange={(e) => setRemoveFromNode(e.target.value)}
            />

            <input
                type="text"
                placeholder="To"
                value={removeToNode}
                onChange={(e) => setRemoveToNode(e.target.value)}
            />

            <button onClick={handleRemoveDependency}>
                Remove Dependency
            </button>

            <hr />

            <h2>Build</h2>

            <input
                type="text"
                placeholder="Changed Node"
                value={buildNode}
                onChange={(e) => setBuildNode(e.target.value)}
            />

            <button onClick={handleBuild}>
                Build
            </button>

        </div>
    );
}

export default ControlPanel;