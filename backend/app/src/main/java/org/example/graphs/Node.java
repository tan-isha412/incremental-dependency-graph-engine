package org.example.graphs;

import java.util.Objects;

public class Node {

    private final String name;
    private int version;
    private boolean dirty;
    private NodeStatus status;

    public Node(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Node name cannot be null or empty.");
        }

        this.name = name;
        this.version = 1;
        this.dirty = false;
        this.status = NodeStatus.READY;
    }

    // Getters

    public String getName() {
        return name;
    }

    public int getVersion() {
        return version;
    }

    public boolean isDirty() {
        return dirty;
    }

    public NodeStatus getStatus() {
        return status;
    }

    // Behaviour

    public void markDirty() {
        this.dirty = true;
    }

    public void markClean() {
        this.dirty = false;
    }

    public void incrementVersion() {
        this.version++;
    }

    public void setStatus(NodeStatus status) {
        this.status = Objects.requireNonNull(status, "Status cannot be null.");
    }

    @Override
    public String toString() {
        return "Node{" +
                "name='" + name + '\'' +
                ", version=" + version +
                ", dirty=" + dirty +
                ", status=" + status +
                '}';
    }
}