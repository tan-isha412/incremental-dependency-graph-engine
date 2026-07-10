function MetricsPanel({ metrics }) {

    if (!metrics) {
        return (
            <div className="metrics-panel">
                <h2>Build Metrics</h2>
                <p>No build executed yet.</p>
            </div>
        );
    }

    return (
        <div className="metrics-panel">

            <h2>Build Metrics</h2>

            <p>
                <strong>Status:</strong> {metrics.success ? "SUCCESS" : "FAILED"}
            </p>

            <p>
                <strong>Build Time:</strong> {metrics.btime} ms
            </p>

            <p>
                <strong>Built Nodes:</strong> {metrics.builtNodes.length}
            </p>

            <p>
                <strong>Total Build Order:</strong> {metrics.buildorder.length}
            </p>

            <p>
                <strong>Message:</strong> {metrics.msg}
            </p>

        </div>
    );
}

export default MetricsPanel;