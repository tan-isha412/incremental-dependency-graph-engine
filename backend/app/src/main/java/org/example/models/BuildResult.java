package org.example.models;

import java.util.*;
import org.example.graphs.Node;

public class BuildResult {
    private final boolean success;
    private final List<Node> buildorder;
    private final List<Node> builtNodes;
    private final long btime;
    private final String msg;

    public BuildResult(boolean success, List<Node> buildorder, List<Node> builtNodes, long btime, String msg) {
        this.success = success;
        this.buildorder = buildorder;
        this.builtNodes = builtNodes;
        this.btime = btime;
        this.msg = msg;
    }

    public boolean isSuccess() {
        return success;
    }

    public List<Node> getBuildorder() {
        return buildorder;
    }

    public List<Node> getBuiltNodes() {
        return builtNodes;
    }

    public long getBtime() {
        return btime;
    }

    public String getMsg() {
        return msg;
    }

    @Override
    public String toString() {
        return "BuildResult{" +
                "success=" + success +
                ", buildTime=" + btime +
                ", builtNodes=" + builtNodes.size() +
                ", message='" + msg + '\'' +
                '}';
    }

}
