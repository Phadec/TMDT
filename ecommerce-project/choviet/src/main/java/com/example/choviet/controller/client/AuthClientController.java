package com.example.choviet.controller.client;

import com.example.choviet.dto.ApiResponse;
import com.example.choviet.dto.AuthResponse;
import com.example.choviet.dto.CustomerRegisterRequest;
import com.example.choviet.dto.LoginRequest;
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
public class AuthClientController {
    @Autowired
    AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.loginCustomer(request);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", response));
    }

    @PostMapping("/register/customer")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody CustomerRegisterRequest request) {
        AuthResponse response = authService.registerCustomer(request);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", response));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AuthResponse>> updateStatus(@PathVariable String id, @RequestParam String status) {
        AuthResponse response = authService.updateStatus(id, status);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", response));
    }

    @PostMapping("/avail")
    public ResponseEntity<ApiResponse<AuthResponse>> isEmailExist(@RequestParam String email){
        AuthResponse avail = authService.isExistEmail(email);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", avail));
    }

}
