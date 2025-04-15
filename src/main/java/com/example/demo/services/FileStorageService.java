package com.example.demo.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {
    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    
    public String storeFile(MultipartFile file, String subDirectory) throws IOException {
        try {
            // Create full path for upload directory
            Path uploadPath = Paths.get(uploadDir, subDirectory).toAbsolutePath().normalize();
            logger.info("Upload directory path: {}", uploadPath);
            
            // Create directories if they don't exist
            File directory = uploadPath.toFile();
            if (!directory.exists()) {
                boolean dirCreated = directory.mkdirs();
                logger.info("Created directory? {}", dirCreated);
                if (!dirCreated && !directory.exists()) {
                    throw new IOException("Failed to create directory: " + uploadPath);
                }
            }
            
            // Check directory is writable
            if (!directory.canWrite()) {
                logger.error("Directory is not writable: {}", uploadPath);
                throw new IOException("Directory is not writable: " + uploadPath);
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
            logger.info("Generated unique filename: {}", uniqueFilename);
            
            // Copy the file to the target location
            Path targetLocation = uploadPath.resolve(uniqueFilename);
            logger.info("Target file location: {}", targetLocation);
            
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            logger.info("File saved successfully to {}", targetLocation);
            
            return uniqueFilename;
        } catch (IOException ex) {
            logger.error("Failed to store file", ex);
            throw ex;
        }
    }
    
    public String getFileUrl(String fileName, String subDirectory) {
        String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/v1/files/")
                .path(subDirectory + "/")
                .path(fileName)
                .toUriString();
        logger.info("Generated file URL: {}", fileUrl);
        return fileUrl;
    }
}