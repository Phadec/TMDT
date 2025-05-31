package com.example.choviet.controller.admin;
import static com.example.choviet.config.Code.*;
import com.example.choviet.dto.*;
import com.example.choviet.service.AuthService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping("/api/v1/admin/auth")
public class AuthAdminController {
    @Autowired
    AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.loginUser(request);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", response));
    }

    @PostMapping("/register/user")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody UserRegisterRequest request) {
        AuthResponse response = authService.registerUser(request);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", response));
    }
}