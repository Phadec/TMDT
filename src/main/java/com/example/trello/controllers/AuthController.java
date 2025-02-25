package com.example.trello.controllers;

import com.example.trello.dtos.LoginDTO;
import com.example.trello.dtos.RegisterDTO;
import com.example.trello.dtos.ForgotPasswordDTO;
import com.example.trello.dtos.ResetPasswordDTO;
import com.example.trello.services.AuthService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterDTO registerDTO) {
        return ResponseEntity.ok(authService.register(registerDTO));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO loginDTO) {
        logger.debug("Login attempt for username: {}", loginDTO.getUsername());
        try {
            return ResponseEntity.ok(authService.login(loginDTO));
        } catch (Exception e) {
            logger.error("Login failed for username: {}, error: {}", loginDTO.getUsername(), e.getMessage());
            throw e;
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordDTO forgotPasswordDTO) {
        authService.forgotPassword(forgotPasswordDTO);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordDTO resetPasswordDTO) {
        authService.resetPassword(resetPasswordDTO);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/verify-email/{token}")
    public ResponseEntity<Void> verifyEmail(@PathVariable String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok().build();
    }

}
