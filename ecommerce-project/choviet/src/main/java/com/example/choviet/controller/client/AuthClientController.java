package com.example.choviet.controller.client;

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
@RequestMapping(CLIENT + AUTH)
public class AuthClientController {
    @Autowired
    AuthService authService;

    @PostMapping(LOGIN)
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.loginCustomer(request);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", response));
    }

    @PostMapping(REGISTER)
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody CustomerRegisterRequest request) {
        AuthResponse response = authService.registerCustomer(request);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", response));
    }

    @PutMapping(UPDATE_STATUS)
    public ResponseEntity<ApiResponse<AuthResponse>> updateStatus(@PathVariable String id, @RequestParam String status) {
        AuthResponse response = authService.updateStatus(id, status);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", response));
    }


    @PutMapping(CHANGE_PASS)
    public ResponseEntity<ApiResponse<AuthResponse>> changePassword(@RequestBody ChangePasswordRequest changePasswordRequest) {
        AuthResponse response =  authService.changePassword(changePasswordRequest);
        return ResponseEntity.ok(new ApiResponse<>( OK, "Đã thay đổi", response));
    }

    @PutMapping(FORGOT_PASS)
    public ResponseEntity<ApiResponse<AuthResponse>> forgotPassword(@RequestBody ChangePasswordRequest changePasswordRequest) {
        AuthResponse response =  authService.forgotPassword(changePasswordRequest);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", response));
    }

    @GetMapping(CONTAIN_EMAIL)
    public ResponseEntity<ApiResponse<AuthResponse>> containEmail(@RequestParam String email){
        AuthResponse response = authService.isExistEmail(email);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", response));
    }
}
