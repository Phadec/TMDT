package com.example.demo.controllers;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
@CrossOrigin
public class FileController {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    
    @Value("${server.port:8080}")
    private String serverPort;

    @GetMapping("/{fileName:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String fileName) {
        try {
            System.out.println("Serving file: " + fileName);
            File uploadDirFile = new File(uploadDir);
            if (!uploadDirFile.exists()) {
                uploadDirFile.mkdirs();
            }
            
            Path filePath = Paths.get(uploadDir).resolve(fileName).normalize();
            System.out.println("Looking for file at: " + filePath.toAbsolutePath());
            
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                String contentType = getContentType(filePath);
                System.out.println("File found with content type: " + contentType);
                
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            } else {
                System.out.println("File not found: " + filePath.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            System.out.println("Error serving file: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // Create directory if it doesn't exist
            File dirFile = new File(uploadDir);
            if (!dirFile.exists()) {
                dirFile.mkdirs();
                System.out.println("Created directory: " + dirFile.getAbsolutePath());
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = UUID.randomUUID().toString() + fileExtension;
            
            // Save file to uploads directory
            Path targetLocation = Paths.get(uploadDir).resolve(newFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            System.out.println("File saved to: " + targetLocation.toAbsolutePath());
            
            // Create response with both relative and absolute URLs
            Map<String, String> response = new HashMap<>();
            String relativePath = "/api/files/" + newFilename;
            String fullUrl = "http://localhost:" + serverPort + relativePath;
            
            response.put("url", relativePath);
            response.put("fullUrl", fullUrl);
            response.put("filename", newFilename);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error uploading file: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> response = new HashMap<>();
            response.put("error", "Could not upload file: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    private String getContentType(Path filePath) {
        try {
            return Files.probeContentType(filePath);
        } catch (IOException e) {
            System.out.println("Could not determine content type: " + e.getMessage());
            return "application/octet-stream";
        }
    }
}