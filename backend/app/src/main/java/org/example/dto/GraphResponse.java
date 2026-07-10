package org.example.dto;

import java.util.List;

public record GraphResponse(

        List<GraphNodeDTO> nodes,

        List<GraphEdgeDTO> edges

) {
}