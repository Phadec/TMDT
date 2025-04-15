package com.example.demo.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dtos.ForgotPasswordDTO;
import com.example.demo.dtos.LoginDTO;
import com.example.demo.dtos.RegisterDTO;
import com.example.demo.dtos.ResetPasswordDTO;
import com.example.demo.services.AuthService;

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

    @PostMapping("/refresh-token")
    public ResponseEntity<Map<String, Object>> refreshToken(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            return ResponseEntity.ok(authService.refreshToken(token));
        }
        return ResponseEntity.badRequest().build();
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
        logger.debug("Received reset password request with token: {}", 
            resetPasswordDTO.getToken() != null ? 
            resetPasswordDTO.getToken().substring(0, Math.min(resetPasswordDTO.getToken().length(), 10)) + "..." : 
            "null");
        
        try {
            authService.resetPassword(resetPasswordDTO);
            logger.debug("Password reset successful");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error during password reset: {}", e.getMessage(), e);
            throw e; // Let the global exception handler deal with it
        }
    }

    @GetMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok().build();
    }

}
