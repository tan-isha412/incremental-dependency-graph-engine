package org.example.controller;

import org.example.dto.DepRequest;
import org.example.dto.GraphResponse;
import org.example.dto.NodeRequest;
import org.example.engine.CycleDetector;
import org.example.service.GraphService;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/graph")
public class GraphController {
    private final GraphService gs;

    public GraphController(GraphService gs) {
        this.gs = gs;
    }

    @PostMapping("/node")
    public void addN(@RequestBody NodeRequest n) {
        gs.addN(n.name());
    }

    @DeleteMapping("/node/{name}")
    public void removeN(@PathVariable String name) {
        gs.removeN(name);
    }

    @PostMapping("/edge")
    public void addDep(@RequestBody DepRequest d) {
        gs.addDep(d.fr(), d.to());
    }

    @DeleteMapping("/edge")
    public void removeDep(@RequestBody DepRequest d) {
        gs.removeDep(d.fr(), d.to());
    }

    @GetMapping
    public GraphResponse getGraph() {
        return gs.getGraph();
    }

    @GetMapping("/cycle")
    public Map<String, Object> checkCycle() {
        CycleDetector detector = new CycleDetector(gs.getInternalGraph());
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("hasCycle", detector.hasCycle());
        result.put("cycle", List.of());
        return result;
    }
}
