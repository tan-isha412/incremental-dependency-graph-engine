package org.example.controller;

import org.example.dto.GraphResponse;
import org.example.engine.AffectedNodeFinder;
import org.example.graphs.Node;
import org.example.service.GraphService;
import org.example.ai.AiImpactService;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/projects")
public class ProjectController {

    private final GraphService graphService;

    public ProjectController(GraphService graphService) {
        this.graphService = graphService;
    }

    public record ScanRequest(String path) {}

    @PostMapping("/scan")
    public GraphResponse scanProject(@RequestBody ScanRequest req) {
        String path = (req != null && req.path() != null && !req.path().isBlank())
                ? req.path()
                : "/backend/app/src/main/java";
        graphService.scanProject(path);
        return graphService.getGraph();
    }

    @GetMapping("/changes")
    public List<String> getChangedFiles() {
        return graphService.detectChangedFiles();
    }

    @GetMapping("/impact/{file}")
    public AiImpactService.ImpactAnalysisReport getImpactAnalysis(@PathVariable String file) {
        if (!graphService.getInternalGraph().containsNode(file)) {
            throw new IllegalArgumentException("Node not found in graph: " + file);
        }

        AffectedNodeFinder finder = new AffectedNodeFinder(graphService.getInternalGraph());
        List<Node> allAffected = finder.findAffectedNodes(file);
        
        Set<Node> dependents = graphService.getInternalGraph().getDependents(file);
        List<Node> directDependents = new ArrayList<>(dependents);

        return graphService.analyzeImpact(file, directDependents, allAffected);
    }
}
