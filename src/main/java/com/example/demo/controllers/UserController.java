package com.example.demo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dtos.UserRequestDTO;
import com.example.demo.dtos.UserResponseDTO;
import com.example.demo.security.SecurityUtils;
import com.example.demo.services.UserService;


import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getCurrentUser() {
        String username = SecurityUtils.getCurrentUsername();
        if (username == null) {
            return ResponseEntity.status(401).build();
        }
        
        UserResponseDTO currentUser = userService.getUserByUsername(username);
        return ResponseEntity.ok(currentUser);
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable String id) {
        // Chỉ cho phép người dùng xem thông tin của chính họ hoặc admin xem tất cả
        String currentUsername = SecurityUtils.getCurrentUsername();
        if (currentUsername == null) {
            return ResponseEntity.status(401).build();
        }
        
        UserResponseDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable String id,
            @Valid @RequestBody UserRequestDTO userRequest) {
        // Chỉ cho phép người dùng cập nhật thông tin của chính họ hoặc admin cập nhật tất cả
        String currentUsername = SecurityUtils.getCurrentUsername();
        if (currentUsername == null) {
            return ResponseEntity.status(401).build();
        }
        
        UserResponseDTO updatedUser = userService.updateUser(id, userRequest);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
}
