package org.example.scanner;

import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.*;
import com.github.javaparser.ast.expr.MethodCallExpr;
import com.github.javaparser.ast.expr.ObjectCreationExpr;
import com.github.javaparser.ast.type.ClassOrInterfaceType;
import org.example.graphs.Graph;
import org.example.kg.KnowledgeGraph;
import org.example.kg.KnowledgeNode;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.util.*;

public class JavaASTAnalyzer {

    public static class ASTAnalysisResult {
        public String className;
        public String packageName;
        public Set<String> importedTypes = new HashSet<>();
        public Set<String> referencedTypes = new HashSet<>();
        public Set<String> extendedTypes = new HashSet<>();
        public Set<String> implementedInterfaces = new HashSet<>();
        public Set<String> calledMethods = new HashSet<>();
        public Set<String> annotations = new HashSet<>();
    }

    public ASTAnalysisResult analyzeFile(File file) {
        ASTAnalysisResult result = new ASTAnalysisResult();
        try {
            CompilationUnit cu = StaticJavaParser.parse(file);
            
            cu.getPackageDeclaration().ifPresent(pkg -> result.packageName = pkg.getNameAsString());
            
            cu.getImports().forEach(imp -> result.importedTypes.add(imp.getNameAsString()));

            cu.findAll(ClassOrInterfaceDeclaration.class).forEach(cid -> {
                if (result.className == null) {
                    result.className = cid.getNameAsString();
                }

                cid.getExtendedTypes().forEach(et -> result.extendedTypes.add(et.getNameAsString()));
                cid.getImplementedTypes().forEach(it -> result.implementedInterfaces.add(it.getNameAsString()));
                cid.getAnnotations().forEach(ann -> result.annotations.add(ann.getNameAsString()));
            });

            cu.findAll(FieldDeclaration.class).forEach(field -> {
                field.getVariables().forEach(var -> {
                    result.referencedTypes.add(var.getTypeAsString());
                });
            });

            cu.findAll(ObjectCreationExpr.class).forEach(oce -> {
                result.referencedTypes.add(oce.getTypeAsString());
            });

            cu.findAll(MethodCallExpr.class).forEach(mce -> {
                result.calledMethods.add(mce.getNameAsString());
            });

        } catch (Exception e) {
            // Fallback lightweight regex parsing if JavaParser hits syntax/preview quirks
            parseWithFallback(file, result);
        }

        if (result.className == null && file.getName().endsWith(".java")) {
            result.className = file.getName().replace(".java", "");
        }

        return result;
    }

    private void parseWithFallback(File file, ASTAnalysisResult result) {
        try {
            List<String> lines = Files.readAllLines(file.toPath());
            for (String line : lines) {
                line = line.trim();
                if (line.startsWith("package ")) {
                    result.packageName = line.replace("package ", "").replace(";", "").trim();
                } else if (line.startsWith("import ")) {
                    result.importedTypes.add(line.replace("import ", "").replace(";", "").trim());
                } else if (line.contains("class ") || line.contains("interface ")) {
                    String[] tokens = line.split("\\s+");
                    for (int i = 0; i < tokens.length - 1; i++) {
                        if (tokens[i].equals("class") || tokens[i].equals("interface")) {
                            result.className = tokens[i + 1].split("<")[0].replaceAll("[^a-zA-Z0-9_]", "");
                            break;
                        }
                    }
                }
            }
        } catch (IOException ignored) {}
    }

    public void populateGraphAndKnowledgeGraph(
            List<File> javaFiles, 
            Graph dependencyGraph, 
            KnowledgeGraph knowledgeGraph,
            Map<String, ASTAnalysisResult> classMap) {

        Map<String, String> shortToSimpleName = new HashMap<>();

        // First pass: register nodes
        for (File f : javaFiles) {
            ASTAnalysisResult ast = analyzeFile(f);
            if (ast.className != null) {
                String fullName = (ast.packageName != null ? ast.packageName + "." : "") + ast.className;
                String simpleName = ast.className + ".java";

                classMap.put(simpleName, ast);
                shortToSimpleName.put(ast.className, simpleName);

                if (!dependencyGraph.containsNode(simpleName)) {
                    dependencyGraph.addNode(simpleName);
                }

                if (knowledgeGraph != null) {
                    knowledgeGraph.addNode(new KnowledgeNode(simpleName, "CLASS", ast.packageName));
                }
            }
        }

        // Second pass: register edges/dependencies
        for (Map.Entry<String, ASTAnalysisResult> entry : classMap.entrySet()) {
            String sourceNode = entry.getKey();
            ASTAnalysisResult ast = entry.getValue();

            // Resolve references
            Set<String> targetCandidates = new HashSet<>();
            targetCandidates.addAll(ast.extendedTypes);
            targetCandidates.addAll(ast.implementedInterfaces);
            targetCandidates.addAll(ast.referencedTypes);

            for (String imported : ast.importedTypes) {
                String simpleImportName = imported.substring(imported.lastIndexOf('.') + 1);
                if (shortToSimpleName.containsKey(simpleImportName)) {
                    targetCandidates.add(simpleImportName);
                }
            }

            for (String targetShort : targetCandidates) {
                String cleanTarget = targetShort.replaceAll("[^a-zA-Z0-9_]", "");
                if (shortToSimpleName.containsKey(cleanTarget)) {
                    String targetNode = shortToSimpleName.get(cleanTarget);
                    if (!targetNode.equals(sourceNode) && dependencyGraph.containsNode(targetNode)) {
                        if (!dependencyGraph.containsDependency(sourceNode, targetNode)) {
                            dependencyGraph.addDependency(sourceNode, targetNode);
                        }

                        if (knowledgeGraph != null) {
                            String relType = "USES";
                            if (ast.extendedTypes.contains(cleanTarget)) relType = "EXTENDS";
                            else if (ast.implementedInterfaces.contains(cleanTarget)) relType = "IMPLEMENTS";
                            else if (ast.importedTypes.stream().anyMatch(i -> i.endsWith("." + cleanTarget))) relType = "IMPORTS";

                            knowledgeGraph.addRelation(sourceNode, targetNode, relType);
                        }
                    }
                }
            }
        }
    }
}
