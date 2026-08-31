package org.example.service;

import java.io.File;
import java.util.*;

import org.example.dto.GraphEdgeDTO;
import org.example.dto.GraphNodeDTO;
import org.example.dto.GraphResponse;
import org.example.graphs.Graph;
import org.example.graphs.Node;
import org.example.kg.KnowledgeGraph;
import org.example.scanner.JavaASTAnalyzer;
import org.example.scanner.JavaProjectScanner;
import org.example.watcher.FileWatcherService;
import org.example.ai.AiImpactService;
import org.springframework.stereotype.Service;

@Service
public class GraphService {
    private final Graph g;
    private final KnowledgeGraph knowledgeGraph;
    private final JavaProjectScanner scanner;
    private final JavaASTAnalyzer astAnalyzer;
    private final FileWatcherService fileWatcher;
    private final AiImpactService aiImpactService;

    private final Map<String, JavaASTAnalyzer.ASTAnalysisResult> astMap = new HashMap<>();
    private List<File> currentProjectFiles = new ArrayList<>();
    private String currentProjectPath = "";

    public GraphService() {
        this.g = new Graph();
        this.knowledgeGraph = new KnowledgeGraph();
        this.scanner = new JavaProjectScanner();
        this.astAnalyzer = new JavaASTAnalyzer();
        this.fileWatcher = new FileWatcherService();
        this.aiImpactService = new AiImpactService();
    }

    public void addN(String n) {
        if (!g.containsNode(n)) {
            g.addNode(n);
        }
    }

    public void removeN(String n) {
        if (g.containsNode(n))
            g.removeNode(n);
    }

    public void addDep(String n1, String n2) {
        if (g.containsNode(n1) && g.containsNode(n2)) {
            if (!g.containsDependency(n1, n2)) {
                g.addDependency(n1, n2);
            }
        }
    }

    public void removeDep(String n1, String n2) {
        g.removeDependency(n1, n2);
    }

    public synchronized void scanProject(String projectPath) {
        this.currentProjectPath = projectPath;
        currentProjectFiles = scanner.discoverJavaFiles(projectPath);

        // Clear existing graph nodes
        Set<String> existingNodes = new HashSet<>(g.getAllNodes());
        for (String node : existingNodes) {
            g.removeNode(node);
        }
        knowledgeGraph.clear();
        astMap.clear();

        for (File file : currentProjectFiles) {
            fileWatcher.registerFile(file);
        }

        astAnalyzer.populateGraphAndKnowledgeGraph(currentProjectFiles, g, knowledgeGraph, astMap);
    }

    public List<String> detectChangedFiles() {
        if (currentProjectFiles.isEmpty()) {
            return Collections.emptyList();
        }
        return fileWatcher.checkForModifiedFiles(currentProjectFiles);
    }

    public GraphResponse getGraph() {
        List<GraphNodeDTO> nodes = new ArrayList<>();
        List<GraphEdgeDTO> edges = new ArrayList<>();

        for (String nodeName : g.getAllNodes()) {
            nodes.add(new GraphNodeDTO(nodeName, nodeName));
        }

        for (String nodeName : g.getAllNodes()) {
            for (Node dependency : g.getDependencies(nodeName)) {
                edges.add(new GraphEdgeDTO(nodeName, dependency.getName()));
            }
        }

        return new GraphResponse(nodes, edges);
    }

    public Graph getInternalGraph() {
        return g;
    }

    public KnowledgeGraph getKnowledgeGraph() {
        return knowledgeGraph;
    }

    public AiImpactService.ImpactAnalysisReport analyzeImpact(String changedNode, List<Node> directDependents, List<Node> allAffected) {
        return aiImpactService.analyzeImpact(
                changedNode,
                directDependents,
                allAffected,
                g.getAllNodes(),
                knowledgeGraph
        );
    }

    public String getCurrentProjectPath() {
        return currentProjectPath;
    }
}
