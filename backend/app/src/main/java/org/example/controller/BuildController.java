package org.example.controller;

import org.example.models.BuildResult;
import org.example.service.BuildService;
import org.springframework.web.bind.annotation.*;
import org.example.dto.NodeRequest;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/build")
public class BuildController {

    private final BuildService buildService;

    public BuildController(BuildService buildService) {
        this.buildService = buildService;
    }

    @PostMapping
    public BuildResult buildNode(@RequestBody NodeRequest node) {
        if (node == null || node.name() == null || node.name().isBlank()) {
            throw new IllegalArgumentException("Node name cannot be empty.");
        }
        return buildService.build(node.name());
    }

    @PostMapping("/{node}")
    public BuildResult buildNodeByPath(@PathVariable String node) {
        if (node == null || node.isBlank()) {
            throw new IllegalArgumentException("Node name cannot be empty.");
        }
        return buildService.build(node);
    }
}
