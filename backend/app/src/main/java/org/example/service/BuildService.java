
package org.example.service;

import org.example.engine.*;
import org.example.models.BuildResult;
import org.springframework.stereotype.Service;

@Service
public class BuildService {

    private final IncrementalBuildEngine engine;

    public BuildService(GraphService graph) {

        // For now we'll initialize an empty graph.
        // Later we'll load it dynamically.

        this.engine = new IncrementalBuildEngine(graph.getInternalGraph());
    }

    public BuildResult build(String changedNode) {

        return engine.build(changedNode);

    }
}
