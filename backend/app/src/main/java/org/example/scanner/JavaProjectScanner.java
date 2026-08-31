package org.example.scanner;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

public class JavaProjectScanner {

    public List<File> discoverJavaFiles(String projectPath) {
        List<File> javaFiles = new ArrayList<>();
        Path root = Paths.get(projectPath);

        if (!Files.exists(root) || !Files.isDirectory(root)) {
            return javaFiles;
        }

        try {
            Files.walk(root)
                .filter(p -> Files.isRegularFile(p) && p.toString().endsWith(".java"))
                .forEach(p -> javaFiles.add(p.toFile()));
        } catch (IOException e) {
            System.err.println("Error scanning directory: " + e.getMessage());
        }

        return javaFiles;
    }
}
