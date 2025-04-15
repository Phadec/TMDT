package com.example.demo.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.services.FileStorageService;
import com.example.demo.services.UserService;
import com.example.demo.dtos.ApiResponse;
import com.example.demo.models.User;
import com.example.demo.utils.SecurityUtils;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
public class FileController {
    private static final Logger logger = LoggerFactory.getLogger(FileController.class);

    @Autowired
    private FileStorageService fileStorageService;
    
    @Autowired
    private UserService userService;
    
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            logger.info("Avatar upload request received");
            
            // Get current user from security context
            String username = SecurityUtils.getCurrentUsername();
            logger.info("Current username: {}", username);
            
            if (username == null) {
                logger.error("User not authenticated");
                return ResponseEntity.badRequest().body(new ApiResponse(false, "User not authenticated"));
            }
            
            // Check if file is empty
            if (file.isEmpty()) {
                logger.error("File is empty");
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Please select a file to upload"));
            }
            
            // Log file details
            logger.info("File details - Name: {}, Size: {}, ContentType: {}", 
                    file.getOriginalFilename(), file.getSize(), file.getContentType());
            
            // Check file type
            String contentType = file.getContentType();
            if (contentType == null || !(contentType.equals("image/jpeg") || contentType.equals("image/png") || contentType.equals("image/jpg"))) {
                logger.error("Invalid file type: {}", contentType);
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Only JPEG, JPG and PNG files are allowed"));
            }
            
            // Check file size (max 2MB)
            if (file.getSize() > 2 * 1024 * 1024) {
                logger.error("File size too large: {}", file.getSize());
                return ResponseEntity.badRequest().body(new ApiResponse(false, "File size cannot exceed 2MB"));
            }
            
            // Upload file
            logger.info("Storing file...");
            String fileName = fileStorageService.storeFile(file, "avatars");
            logger.info("File stored with name: {}", fileName);
            
            // Get complete file path/URL
            String fileUrl = fileStorageService.getFileUrl(fileName, "avatars");
            logger.info("File URL generated: {}", fileUrl);
            
            // Update user avatar in database
            logger.info("Updating user avatar in database");
            User user = userService.findByUsername(username);
            user.setAvatar(fileUrl);
            userService.updateAvatar(user);
            logger.info("User avatar updated successfully");
            
            // Return response - match the format the frontend expects
            Map<String, String> response = new HashMap<>();
            response.put("avatar", fileUrl);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error uploading avatar", e);
            return ResponseEntity.status(500).body(new ApiResponse(false, "Failed to upload avatar: " + e.getMessage()));
        }
    }
}