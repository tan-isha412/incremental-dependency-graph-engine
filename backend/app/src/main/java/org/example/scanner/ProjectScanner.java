package org.example.scanner;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.stream.Stream;

public class ProjectScanner {

    public List<Path> getFiles(String path) {

        Path root = Paths.get(path);
        if (!Files.exists(root) || !Files.isDirectory(root)) {
            throw new IllegalArgumentException("Invalid project directory: " + path);
        }
        try (Stream<Path> stream = Files.walk(root)) {
            return stream
                    .filter(Files::isRegularFile)
                    .filter(p -> p.getFileName().toString().endsWith(".java"))
                    .toList();

        } catch (IOException e) {
            throw new RuntimeException("Error scanning project directory", e);
        }
    }
}