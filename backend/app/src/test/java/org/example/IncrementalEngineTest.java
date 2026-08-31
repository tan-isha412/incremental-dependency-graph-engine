package org.example;

import org.example.engine.*;
import org.example.graphs.Graph;
import org.example.graphs.Node;
import org.example.models.BuildResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class IncrementalEngineTest {

    private Graph graph;
    private IncrementalBuildEngine engine;

    @BeforeEach
    void setUp() {
        graph = new Graph();
        engine = new IncrementalBuildEngine(graph);
    }

    @Test
    void testLinearDependencyBuild() {
        // App.java -> Service.java -> Repo.java
        graph.addNode("Repo.java");
        graph.addNode("Service.java");
        graph.addNode("App.java");

        graph.addDependency("Service.java", "Repo.java");
        graph.addDependency("App.java", "Service.java");

        BuildResult result = engine.build("Repo.java");

        assertTrue(result.isSuccess());
        assertEquals(3, result.getBuildorder().size());
        assertEquals("Repo.java", result.getBuildorder().get(0).getName());
        assertEquals("Service.java", result.getBuildorder().get(1).getName());
        assertEquals("App.java", result.getBuildorder().get(2).getName());
    }

    @Test
    void testCycleDetection() {
        graph.addNode("A.java");
        graph.addNode("B.java");

        graph.addDependency("A.java", "B.java");
        graph.addDependency("B.java", "A.java");

        CycleDetector detector = new CycleDetector(graph);
        assertTrue(detector.hasCycle());
        assertThrows(IllegalStateException.class, () -> engine.build("A.java"));
    }

    @Test
    void testDiamondDependencyBuild() {
        // Core -> Auth, Core -> Data, Auth -> App, Data -> App
        graph.addNode("Core.java");
        graph.addNode("Auth.java");
        graph.addNode("Data.java");
        graph.addNode("App.java");

        graph.addDependency("Auth.java", "Core.java");
        graph.addDependency("Data.java", "Core.java");
        graph.addDependency("App.java", "Auth.java");
        graph.addDependency("App.java", "Data.java");

        BuildResult result = engine.build("Core.java");

        assertTrue(result.isSuccess());
        assertEquals(4, result.getBuiltNodes().size());
    }
}
