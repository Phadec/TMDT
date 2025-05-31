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
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", response));
    }

    @PostMapping("/register/user")
    public ResponseEntity<ApiResponse<AuthResponse>> registerUser(@RequestBody UserRegisterRequest request) {
        AuthResponse response = authService.registerUser(request);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", response));
    }

    @PostMapping("/register/customer")
    public ResponseEntity<ApiResponse<AuthResponse>> registerCustomer(@RequestBody CustomerRegisterRequest request) {
        AuthResponse response = authService.registerCustomer(request);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", response));
    }

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