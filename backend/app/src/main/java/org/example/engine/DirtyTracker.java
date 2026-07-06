package org.example.engine;

import org.example.graphs.Node;

import java.util.List;

public class DirtyTracker {

    private final AffectedNodeFinder finder;

    public DirtyTracker(AffectedNodeFinder finder) {
        this.finder = finder;
    }

    public void markDirty(String changedNode) {

        List<Node> affectedNodes = finder.findAffectedNodes(changedNode);

        for (Node node : affectedNodes) {
            node.markDirty();
        }
    }
}