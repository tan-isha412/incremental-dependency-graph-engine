package org.example.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UploadRequest(List<UploadedFile> files, String folderName) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record UploadedFile(String name, String content) {
    }
}
