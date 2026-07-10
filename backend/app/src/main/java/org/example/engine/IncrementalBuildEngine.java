package org.example.engine;

import org.example.models.BuildResult;
import org.example.graphs.Graph;
import org.example.graphs.Node;
import org.example.graphs.NodeStatus;

import java.util.*;

public class IncrementalBuildEngine {

    private final Graph graph;
    private final AffectedNodeFinder finder;
    private final DirtyTracker dirtyTracker;
    private final CycleDetector cycleDetector;
    private final BuildOrderResolver resolver;

    public IncrementalBuildEngine(Graph graph) {
        this.graph = graph;
        this.finder = new AffectedNodeFinder(graph);
        this.dirtyTracker = new DirtyTracker(finder);
        this.cycleDetector = new CycleDetector(graph);
        this.resolver = new BuildOrderResolver(graph);
    }

    public BuildResult build(String changedNode) {

        long startTime = System.currentTimeMillis();
        dirtyTracker.markDirty(changedNode);
        List<Node> affectedNodes = finder.findAffectedNodes(changedNode);

        // Step 3: Validate graph
        if (cycleDetector.hasCycle()) {
            throw new IllegalStateException("Dependency cycle detected!");
        }

        // Step 4: Get build order
        List<Node> buildOrder = resolver.getBuildOrder(affectedNodes);

        // Step 5: Simulate build

        List<Node> builtNodes = new ArrayList<>();

        for (Node node : buildOrder) {

            if (!node.isDirty())
                continue;

            node.setStatus(NodeStatus.RUNNING);

            // Simulate successful build
            node.incrementVersion();
            node.markClean();
            node.setStatus(NodeStatus.COMPLETED);

            builtNodes.add(node);
        }
        long endtime = System.currentTimeMillis();
        return new BuildResult(true, buildOrder, builtNodes, (endtime - startTime), "Build completed successfully.");
    }
}