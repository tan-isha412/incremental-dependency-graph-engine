package org.example.watcher;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class FileWatcherService {

    private final Map<String, String> fileHashes = new ConcurrentHashMap<>();
    private final Map<String, Long> fileLastModified = new ConcurrentHashMap<>();

    public void registerFile(File file) {
        if (!file.exists() || !file.isFile()) return;
        String hash = computeHash(file);
        fileHashes.put(file.getAbsolutePath(), hash);
        fileLastModified.put(file.getAbsolutePath(), file.lastModified());
    }

    public List<String> checkForModifiedFiles(List<File> trackedFiles) {
        List<String> modifiedFiles = new ArrayList<>();
        for (File file : trackedFiles) {
            if (!file.exists()) continue;

            long currentModified = file.lastModified();
            Long previousModified = fileLastModified.get(file.getAbsolutePath());

            if (previousModified == null || currentModified > previousModified) {
                String currentHash = computeHash(file);
                String previousHash = fileHashes.get(file.getAbsolutePath());

                if (!currentHash.equals(previousHash)) {
                    fileHashes.put(file.getAbsolutePath(), currentHash);
                    fileLastModified.put(file.getAbsolutePath(), currentModified);
                    modifiedFiles.add(file.getName());
                }
            }
        }
        return modifiedFiles;
    }

    private String computeHash(File file) {
        try {
            byte[] data = Files.readAllBytes(file.toPath());
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(data);
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            return String.valueOf(file.lastModified());
        }
    }
}
