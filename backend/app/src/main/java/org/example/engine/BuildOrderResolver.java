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
        Deque<Node> stack = new ArrayDeque<>();
        Set<Node> allowedNodes = new HashSet<>(affectedNodes);
        for (Node node : affectedNodes) {

            if (!visited.contains(node)) {
                dfs(node, allowedNodes, visited, stack);
            }
        }

        List<Node> buildOrder = new ArrayList<>();

        while (!stack.isEmpty()) {
            buildOrder.add(stack.pop());
        }

        return buildOrder;
    }

    private void dfs(Node current,
            Set<Node> allowedNodes,
            Set<Node> visited,
            Deque<Node> stack) {

        visited.add(current);

        for (Node neighbour : graph.getDependencies(current.getName())) {
            if (allowedNodes.contains(neighbour) && !visited.contains(neighbour)) {
                dfs(neighbour, allowedNodes, visited, stack);
            }
        }

        stack.push(current);
    }
}