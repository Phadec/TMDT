package com.example.choviet.controller.admin;

import com.example.choviet.dto.ApiResponse;
import com.example.choviet.dto.AuthResponse;
import com.example.choviet.dto.LoginRequest;
import com.example.choviet.dto.UserRegisterRequest;
import com.example.choviet.service.AuthService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.example.choviet.config.Code.OK;
import static com.example.choviet.config.api.Mid.*;
import static com.example.choviet.config.api.Prefix.*;
import static com.example.choviet.config.api.suffix.Auth.*;

@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping(ADMIN + AUTH)
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class AuthAdminController {
    @Autowired
    AuthService authService;

    @PostMapping(LOGIN)
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.loginUser(request);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", response));
    /**
     * Processes a POST request.
     *
     * @param entity the request entity
     * @return the response entity
     */
    }

    @PostMapping(REGISTER)
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody UserRegisterRequest request) {
        AuthResponse response = authService.registerUser(request);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", response));
    }
}