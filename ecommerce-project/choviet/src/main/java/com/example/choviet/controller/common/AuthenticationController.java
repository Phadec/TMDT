package com.example.choviet.controller.common;
import static com.example.choviet.config.Code.*;
import com.example.choviet.dto.*;
import com.example.choviet.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/common/authentication")
public class AuthenticationController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request) {
        LoginResponse response = userService.login(request);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto>> register(@RequestBody RegisterRequest request) {
        UserDto userDto = userService.register(request);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", userDto));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refreshToken(@RequestBody TokenRefreshRequest request) {
        TokenRefreshResponse response = userService.refreshToken(request);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(@PathVariable String id, @RequestBody ProfileUpdateRequest request) {
        UserDto updatedUser = userService.updateProfile(id, request);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", updatedUser));
    }

    @PostMapping("/{id}/logout")
    public ResponseEntity<?> logout(@PathVariable String id) {
        userService.logout(id);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", "Logout"));
    }

    @PutMapping("/change")
    public ResponseEntity<ApiResponse<UserDto>> changePassword(@RequestBody ChangePasswordRequest changePasswordRequest) {
        UserDto response =  userService.changePassword(changePasswordRequest);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", response));
    }

    @PutMapping("/forgot")
    public ResponseEntity<ApiResponse<UserDto>> forgotPassword(@RequestBody ChangePasswordRequest changePasswordRequest) {
        UserDto response =  userService.forgotPassword(changePasswordRequest);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", response));
    }
}