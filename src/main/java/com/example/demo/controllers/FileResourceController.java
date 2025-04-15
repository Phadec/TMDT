package com.example.demo.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/v1/files")
public class FileResourceController {
    private static final Logger logger = LoggerFactory.getLogger(FileResourceController.class);

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    
    @GetMapping("/{subDirectory}/{fileName:.+}")
    public ResponseEntity<Resource> getFile(
            @PathVariable String subDirectory,
            @PathVariable String fileName) {
        try {
            Path filePath = Paths.get(uploadDir, subDirectory, fileName).toAbsolutePath();
            logger.info("Requested file path: {}", filePath);
            
            // Check if file exists
            File file = filePath.toFile();
            if (!file.exists()) {
                logger.error("File does not exist: {}", filePath);
                return ResponseEntity.notFound().build();
            }
            
            logger.info("File exists: {} (readable: {})", filePath, file.canRead());
            
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                String contentType = determineContentType(fileName);
                logger.info("Serving file: {} with content type: {}", filePath, contentType);
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                logger.error("Resource exists: {}, isReadable: {}", resource.exists(), resource.isReadable());
                return ResponseEntity.notFound().build();
            }
        } catch (Exception ex) {
            logger.error("Error serving file: {}", ex.getMessage(), ex);
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    private String determineContentType(String fileName) {
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (fileName.endsWith(".png")) {
            return "image/png";
        } else if (fileName.endsWith(".gif")) {
            return "image/gif";
        } else {
            return "application/octet-stream";
        }
    }
}