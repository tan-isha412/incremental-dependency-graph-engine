package org.example.controller;

import org.example.dto.DepRequest;
import org.example.dto.GraphResponse;
import org.example.dto.NodeRequest;
import org.example.service.GraphService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/graph")
public class GraphController {
    private final GraphService gs;

    public GraphController(GraphService gs) {
        this.gs = gs;
    }

    @PostMapping("/node")
    public void addN(@RequestBody NodeRequest n) {
        gs.addN(n.name());
    }

    @DeleteMapping("/node")
    public void removeN(@RequestBody NodeRequest n) {
        gs.removeN(n.name());
    }

    @PostMapping("/dependency")
    public void addDep(@RequestBody DepRequest d) {

        gs.addDep(d.fr(), d.to());
    }

    @DeleteMapping("/dependency")
    public void removeDep(@RequestBody DepRequest d) {
        gs.removeDep(d.fr(), d.to());
    }

    @GetMapping
    public GraphResponse getGraph() {
        return gs.getGraph();
    }
}
