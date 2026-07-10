package org.example.controller;

import org.example.models.BuildResult;
import org.example.service.BuildService;
import org.springframework.web.bind.annotation.*;
import org.example.dto.NodeRequest;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/build")
public class BuildController {

    private final BuildService buildService;

    public BuildController(BuildService buildService) {
        this.buildService = buildService;
    }

    @PostMapping("/{node}")
    public BuildResult build(@RequestBody NodeRequest node) {

        if (node == null)
            throw new IllegalArgumentException("Node name cannot be empty.");

        return buildService.build(node.name());
    }
}