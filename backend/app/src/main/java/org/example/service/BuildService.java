
package org.example.service;

import org.example.engine.*;
import org.example.models.BuildResult;
import org.springframework.stereotype.Service;

@Service
public class BuildService {

    private final IncrementalBuildEngine engine;
    private final GraphService graphService;

    public BuildService(GraphService graphService) {
        this.graphService = graphService;
        this.engine = new IncrementalBuildEngine(graphService.getInternalGraph());
    }

    public BuildResult build(String changedNode) {
        if (!graphService.getInternalGraph().containsNode(changedNode)) {
            graphService.addN(changedNode);
        }
        return engine.build(changedNode);
    }
}
