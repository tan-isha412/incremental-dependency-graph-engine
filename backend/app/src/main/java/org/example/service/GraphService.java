package org.example.service;

import java.util.ArrayList;
import java.util.List;

import org.example.dto.GraphEdgeDTO;
import org.example.dto.GraphNodeDTO;
import org.example.dto.GraphResponse;
import org.example.graphs.Graph;
import org.springframework.stereotype.Service;
import org.example.graphs.Node;

@Service
public class GraphService {
    private final Graph g;

    public GraphService() {
        this.g = new Graph();
    }

    public void addN(String n) {
        g.addNode(n);
    }

    public void removeN(String n) {
        if (g.containsNode(n))
            g.removeNode(n);
    }

    public void addDep(String n1, String n2) {
        if (g.containsNode(n1)
                && g.containsNode(n2))
            g.addDependency(n1, n2);
    }

    public void removeDep(String n1, String n2) {
        g.removeDependency(n1, n2);
    }

    public GraphResponse getGraph() {

        List<GraphNodeDTO> nodes = new ArrayList<>();
        List<GraphEdgeDTO> edges = new ArrayList<>();

        // Create node DTOs
        for (String nodeName : g.getAllNodes()) {

            nodes.add(
                    new GraphNodeDTO(
                            nodeName,
                            nodeName));
        }

        // Create edge DTOs
        for (String nodeName : g.getAllNodes()) {

            for (Node dependency : g.getDependencies(nodeName)) {

                edges.add(
                        new GraphEdgeDTO(
                                nodeName,
                                dependency.getName()));
            }
        }

        return new GraphResponse(nodes, edges);
    }

    public Graph getInternalGraph() {
        return g;
    }
}
