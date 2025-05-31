package com.example.choviet.controller.common;

import com.example.choviet.dto.*;
import com.example.choviet.service.AuthService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.example.choviet.config.Code.OK;
@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping("/api/v1/client/auth")
public class AuthController {
    @Autowired
    AuthService authService;

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refreshToken(@RequestBody TokenRefreshRequest request) {
        TokenRefreshResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", response));
    }

    @PostMapping("/{id}/logout")
    public ResponseEntity<?> logout(@PathVariable String id) {
        authService.logout(id);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", "Logout"));
    }

    @PutMapping("/change")
    public ResponseEntity<ApiResponse<AuthResponse>> changePassword(@RequestBody ChangePasswordRequest changePasswordRequest) {
        AuthResponse response =  authService.changePassword(changePasswordRequest);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", response));
    }

    @PutMapping("/forgot")
    public ResponseEntity<ApiResponse<AuthResponse>> forgotPassword(@RequestBody ChangePasswordRequest changePasswordRequest) {
        AuthResponse response =  authService.forgotPassword(changePasswordRequest);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", response));
    }
}
