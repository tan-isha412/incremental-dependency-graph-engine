package org.example.engine;

import org.example.graphs.Graph;
import org.example.graphs.Node;

import java.util.*;

public class AffectedNodeFinder {

    private final Graph graph;

    public AffectedNodeFinder(Graph graph) {
        this.graph = graph;
    }

    public List<Node> findAffectedNodes(String startNode) {

        Node source = graph.getNode(startNode);

        if (source == null) {
            throw new IllegalArgumentException("Node not found : " + startNode);
        }

        List<Node> affectedNodes = new ArrayList<>();
        Set<Node> visited = new HashSet<>();

        dfs(source, visited, affectedNodes);

        return affectedNodes;
    }

    private void dfs(Node current,
            Set<Node> visited,
            List<Node> affectedNodes) {

        if (visited.contains(current))
            return;

        visited.add(current);
        affectedNodes.add(current);

        for (Node neighbour : graph.getDependents(current.getName())) {
            dfs(neighbour, visited, affectedNodes);
        }
    }
}