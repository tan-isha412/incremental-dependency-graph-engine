package org.example.engine;

import org.example.graphs.Graph;
import org.example.graphs.Node;

import java.util.*;

public class BuildOrderResolver {

    private final Graph graph;

    public BuildOrderResolver(Graph graph) {
        this.graph = graph;
    }

    public List<Node> getBuildOrder(Collection<Node> affectedNodes) {

        Set<Node> visited = new HashSet<>();
        List<Node> buildOrder = new ArrayList<>();
        Set<Node> allowedNodes = new HashSet<>(affectedNodes);
        for (Node node : affectedNodes) {

            if (!visited.contains(node)) {
                dfs(node, allowedNodes, visited, buildOrder);
            }
        }

        return buildOrder;
    }

    // Post-order DFS over "depends on" edges: a node is only appended after all
    // of its own dependencies have been appended, so the result is already in
    // correct build order (dependencies before dependents) with no reversal needed.
    private void dfs(Node current,
            Set<Node> allowedNodes,
            Set<Node> visited,
            List<Node> buildOrder) {

        visited.add(current);

        for (Node neighbour : graph.getDependencies(current.getName())) {
            if (allowedNodes.contains(neighbour) && !visited.contains(neighbour)) {
                dfs(neighbour, allowedNodes, visited, buildOrder);
            }
        }

        buildOrder.add(current);
    }
}