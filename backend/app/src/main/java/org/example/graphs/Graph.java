package org.example.graphs;

import java.util.*;

public class Graph {

    private final Map<String, Node> nodes;
    private final Map<Node, Set<Node>> adjacencyList;
    private final Map<Node, Set<Node>> reverseAdjacencyList;

    public Graph() {
        nodes = new HashMap<>();
        adjacencyList = new HashMap<>();
        reverseAdjacencyList = new HashMap<>();
    }

    // -------------------------
    // Node Operations
    // -------------------------

    public void addNode(String name) {

        if (nodes.containsKey(name)) {
            throw new IllegalArgumentException("Node already exists : " + name);
        }

        Node node = new Node(name);

        nodes.put(name, node);
        adjacencyList.put(node, new HashSet<>());
        reverseAdjacencyList.put(node, new HashSet<>());
    }

    public void removeNode(String name) {

        Node node = nodes.get(name);

        if (node == null) {
            throw new IllegalArgumentException("Node not found : " + name);
        }

        // Remove outgoing edges
        for (Node dependency : adjacencyList.get(node)) {
            reverseAdjacencyList.get(dependency).remove(node);
        }

        // Remove incoming edges
        for (Node dependent : reverseAdjacencyList.get(node)) {
            adjacencyList.get(dependent).remove(node);
        }

        adjacencyList.remove(node);
        reverseAdjacencyList.remove(node);
        nodes.remove(name);
    }

    // -------------------------
    // Dependency Operations
    // -------------------------

    public void addDependency(String from, String to) {

        Node fromNode = nodes.get(from);
        Node toNode = nodes.get(to);

        if (fromNode == null || toNode == null) {
            throw new IllegalArgumentException("One or both nodes do not exist.");
        }

        adjacencyList.get(fromNode).add(toNode);
        reverseAdjacencyList.get(toNode).add(fromNode);
    }

    public void removeDependency(String from, String to) {

        Node fromNode = nodes.get(from);
        Node toNode = nodes.get(to);

        if (fromNode == null || toNode == null) {
            throw new IllegalArgumentException("One or both nodes do not exist.");
        }

        adjacencyList.get(fromNode).remove(toNode);
        reverseAdjacencyList.get(toNode).remove(fromNode);
    }

    // -------------------------
    // Utility Methods
    // -------------------------

    public boolean containsNode(String name) {
        return nodes.containsKey(name);
    }

    public boolean containsDependency(String fr, String to) {
        if (fr == null || to == null)
            throw new IllegalArgumentException("Empty strings cant have dependencies");
        return adjacencyList.get(nodes.get(fr)).contains(nodes.get(to));
    }

    public Node getNode(String name) {
        return nodes.get(name);
    }

    public Set<String> getAllNodes() {
        return Collections.unmodifiableSet(nodes.keySet());
    }

    public Set<Node> getDependencies(String name) {

        Node node = nodes.get(name);

        if (node == null) {
            throw new IllegalArgumentException("Node not found : " + name);
        }

        return Collections.unmodifiableSet(adjacencyList.get(node));
    }

    public Set<Node> getDependents(String name) {

        Node node = nodes.get(name);

        if (node == null) {
            throw new IllegalArgumentException("Node not found : " + name);
        }

        return Collections.unmodifiableSet(reverseAdjacencyList.get(node));
    }

    public void printGraph() {

        System.out.println("\n========== Dependency Graph ==========\n");

        for (Node node : adjacencyList.keySet()) {

            System.out.print(node.getName() + " -> ");

            Set<Node> neighbours = adjacencyList.get(node);

            if (neighbours.isEmpty()) {
                System.out.println("[]");
                continue;
            }

            System.out.print("[ ");

            for (Node neighbour : neighbours) {
                System.out.print(neighbour.getName() + " ");
            }

            System.out.println("]");
        }

        System.out.println("\n======================================");
    }

    public void printReverseGraph() {
        System.out.println("Reverse Dependency Graph:");
        for (Map.Entry<Node, Set<Node>> entry : reverseAdjacencyList.entrySet()) {

            Set<Node> neigh = entry.getValue();

            if (neigh.isEmpty()) {
                System.out.println("[]");
                continue;
            }
            System.out.print("[");
            for (Node nod : neigh) {
                System.out.print(nod.getName() + " ");
            }
            System.out.println("]");
        }
    }
}