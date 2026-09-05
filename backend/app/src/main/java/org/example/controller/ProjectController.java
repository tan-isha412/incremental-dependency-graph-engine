package org.example.controller;

import org.example.dto.GraphResponse;
import org.example.dto.UploadRequest;
import org.example.engine.AffectedNodeFinder;
import org.example.graphs.Node;
import org.example.service.GraphService;
import org.example.ai.AiImpactService;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private static final String DEFAULT_SCAN_PATH = "backend/app/src/main/java";

    private final GraphService graphService;

    public ProjectController(GraphService graphService) {
        this.graphService = graphService;
    }

    public record ScanRequest(String path) {}

    @PostMapping("/scan")
    public GraphResponse scanProject(@RequestBody(required = false) ScanRequest req) {
        String path = (req != null && req.path() != null && !req.path().isBlank())
                ? req.path()
                : DEFAULT_SCAN_PATH;
        graphService.scanProject(path);
        return graphService.getGraph();
    }

    @PostMapping("/upload")
    public Map<String, Object> uploadProject(@RequestBody UploadRequest req) {
        if (req == null || req.files() == null || req.files().isEmpty()) {
            throw new IllegalArgumentException("No Java files provided");
        }

        String folder = (req.folderName() == null || req.folderName().isBlank())
                ? "uploaded-project"
                : req.folderName();

        Path targetDir;
        try {
            Path base = Files.createTempDirectory("idge-upload-");
            targetDir = base.resolve(folder).normalize();
            Files.createDirectories(targetDir);

            for (UploadRequest.UploadedFile f : req.files()) {
                if (f.name() == null || f.content() == null) continue;

                Path filePath = targetDir.resolve(f.name()).normalize();
                if (!filePath.startsWith(targetDir)) {
                    // reject any path escaping the upload sandbox
                    continue;
                }

                Files.createDirectories(filePath.getParent());
                Files.writeString(filePath, f.content());
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to process upload: " + e.getMessage(), e);
        }

        graphService.scanProject(targetDir.toString());
        GraphResponse graph = graphService.getGraph();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Uploaded and scanned " + req.files().size() + " Java file(s).");
        response.put("uploadPath", targetDir.toString());
        response.put("nodes", graph.nodes());
        response.put("edges", graph.edges());
        return response;
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
