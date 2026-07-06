package org.example.engine;

import org.example.graphs.Graph;
import org.example.graphs.Node;

import java.util.HashSet;
import java.util.Set;

public class CycleDetector {

    private final Graph graph;

    public CycleDetector(Graph graph) {
        this.graph = graph;
    }

    public boolean hasCycle() {

        Set<Node> visited = new HashSet<>();
        Set<Node> recursionStack = new HashSet<>();

        for (String nodeName : graph.getAllNodes()) {

            Node node = graph.getNode(nodeName);

            if (!visited.contains(node)) {

                if (dfs(node, visited, recursionStack))
                    return true;
            }
        }

        return false;
    }

    private boolean dfs(Node current,
            Set<Node> visited,
            Set<Node> recursionStack) {

        visited.add(current);
        recursionStack.add(current);

        for (Node neighbour : graph.getDependencies(current.getName())) {

            if (!visited.contains(neighbour)) {

                if (dfs(neighbour, visited, recursionStack))
                    return true;
            }

            else if (recursionStack.contains(neighbour)) {

                return true;
            }
        }

        recursionStack.remove(current);

        return false;
    }
}