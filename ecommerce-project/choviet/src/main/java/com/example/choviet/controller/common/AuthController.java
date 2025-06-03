package com.example.choviet.controller.common;
import com.example.choviet.dto.*;
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
@RequestMapping(COMMON + AUTH)
public class AuthController {
    @Autowired
    AuthService authService;



    @PostMapping(LOGOUT)
    public ResponseEntity<?> logout(@RequestBody PersonRequest request) {
        authService.logout(request);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", "Logout"));
    }

    @PutMapping(CHANGE_PASS)
    public ResponseEntity<ApiResponse<AuthResponse>> changePassword(@RequestBody ChangePasswordRequest changePasswordRequest) {
        AuthResponse response =  authService.changePassword(changePasswordRequest);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", response));
    }

    @PutMapping(FORGOT_PASS)
    public ResponseEntity<ApiResponse<AuthResponse>> forgotPassword(@RequestBody ChangePasswordRequest changePasswordRequest) {
        AuthResponse response =  authService.forgotPassword(changePasswordRequest);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", response));
    }
}
