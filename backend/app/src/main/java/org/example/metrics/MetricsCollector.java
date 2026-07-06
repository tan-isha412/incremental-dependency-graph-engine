package org.example.metrics;

public class MetricsCollector {

    private long startTime;
    private long endTime;

    private int nodesBuilt;
    private int nodesSkipped;

    private int cacheHits;
    private int cacheMisses;

    public void start() {
        startTime = System.currentTimeMillis();
    }

    public void stop() {
        endTime = System.currentTimeMillis();
    }

    public long getBuildTime() {
        return endTime - startTime;
    }

    public void incrementBuilt() {
        nodesBuilt++;
    }

    public void incrementSkipped() {
        nodesSkipped++;
    }

    public void incrementCacheHit() {
        cacheHits++;
    }

    public void incrementCacheMiss() {
        cacheMisses++;
    }

    public int getNodesBuilt() {
        return nodesBuilt;
    }

    public int getNodesSkipped() {
        return nodesSkipped;
    }

    public int getCacheHits() {
        return cacheHits;
    }

    public int getCacheMisses() {
        return cacheMisses;
    }

    public void reset() {
        nodesBuilt = 0;
        nodesSkipped = 0;
        cacheHits = 0;
        cacheMisses = 0;
        startTime = 0;
        endTime = 0;
    }

}
