package org.example.ai;

import org.example.graphs.Node;
import org.example.kg.KnowledgeGraph;
import org.example.kg.KnowledgeRelation;

import java.util.*;
import java.util.stream.Collectors;

public class AiImpactService {

    public static class ImpactAnalysisReport {
        public String changedFile;
        public List<String> directDependents;
        public List<String> indirectDependents;
        public List<String> potentialTestsToRerun;
        public List<String> unaffectedFiles;
        public String riskLevel;
        public String aiExplanation;

        public ImpactAnalysisReport(
                String changedFile,
                List<String> directDependents,
                List<String> indirectDependents,
                List<String> potentialTestsToRerun,
                List<String> unaffectedFiles,
                String riskLevel,
                String aiExplanation) {
            this.changedFile = changedFile;
            this.directDependents = directDependents;
            this.indirectDependents = indirectDependents;
            this.potentialTestsToRerun = potentialTestsToRerun;
            this.unaffectedFiles = unaffectedFiles;
            this.riskLevel = riskLevel;
            this.aiExplanation = aiExplanation;
        }
    }

    public ImpactAnalysisReport analyzeImpact(
            String changedFile,
            List<Node> directDependentsNodes,
            List<Node> allAffectedNodes,
            Set<String> allGraphNodes,
            KnowledgeGraph knowledgeGraph) {

        List<String> directNames = directDependentsNodes.stream()
                .map(Node::getName)
                .collect(Collectors.toList());

        List<String> allAffectedNames = allAffectedNodes.stream()
                .map(Node::getName)
                .collect(Collectors.toList());

        List<String> indirectNames = allAffectedNames.stream()
                .filter(name -> !name.equals(changedFile) && !directNames.contains(name))
                .collect(Collectors.toList());

        List<String> unaffected = allGraphNodes.stream()
                .filter(name -> !allAffectedNames.contains(name))
                .collect(Collectors.toList());

        List<String> testFiles = new ArrayList<>();
        for (String node : allAffectedNames) {
            String testCandidate = node.replace(".java", "Test.java");
            if (allGraphNodes.contains(testCandidate) || node.contains("Service") || node.contains("Controller")) {
                testFiles.add(node.replace(".java", "") + "Test.java");
            }
        }

        String risk = allAffectedNames.size() > 4 ? "HIGH" : (allAffectedNames.size() > 2 ? "MEDIUM" : "LOW");

        StringBuilder reasoning = new StringBuilder();
        reasoning.append("Modifying '").append(changedFile).append("' impacts ")
                .append(directNames.size()).append(" direct dependents and ")
                .append(indirectNames.size()).append(" downstream transitive dependents. ");

        if (knowledgeGraph != null) {
            List<KnowledgeRelation> rels = knowledgeGraph.getRelationsForNode(changedFile);
            if (!rels.isEmpty()) {
                reasoning.append("Extracted AST relationships include: ");
                for (int i = 0; i < Math.min(3, rels.size()); i++) {
                    reasoning.append(rels.get(i).toString()).append("; ");
                }
            }
        }

        reasoning.append("Rebuilding only affected subgraph saved rebuilding ")
                .append(unaffected.size()).append(" unrelated file(s).");

        return new ImpactAnalysisReport(
                changedFile,
                directNames,
                indirectNames,
                testFiles,
                unaffected,
                risk,
                reasoning.toString()
        );
    }
}
