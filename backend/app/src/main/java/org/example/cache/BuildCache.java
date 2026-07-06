package org.example.cache;

import org.example.graphs.Node;

import java.util.HashMap;
import java.util.Map;

public class BuildCache {

    private final Map<String, Integer> cache;

    public BuildCache() {
        cache = new HashMap<>();
    }

    public void update(Node node) {
        cache.put(node.getName(), node.getVersion());
    }

    public boolean isUpToDate(Node node) {

        Integer cachedVersion = cache.get(node.getName());

        return cachedVersion != null &&
                cachedVersion == node.getVersion();
    }

    public void clear() {
        cache.clear();
    }
}