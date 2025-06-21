package com.example.choviet.controller.admin;

import com.example.choviet.dto.ApiResponse;
import com.example.choviet.entity.User;
import com.example.choviet.service.UserService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.example.choviet.config.Code.*;
import static com.example.choviet.config.api.Mid.*;
import static com.example.choviet.config.api.Prefix.*;
import static com.example.choviet.config.api.suffix.User.*;

@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping(ADMIN + USER)
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class UserAdminController {

    @Autowired
    UserService userService;

    // Lấy tất cả người dùng với phân trang
    @GetMapping
    public ResponseEntity<ApiResponse<Page<User>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<User> users = userService.getAllUsersPaging(page, size);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", users));
    }    // Lấy người dùng theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable String id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", user));
    }

    // Cập nhật trạng thái người dùng
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<User>> updateUserStatus(
            @PathVariable String id,
            @RequestBody UpdateStatusRequest request) {
        User user = userService.updateUserStatus(id, request.getStatus());
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", user));
    }

    // Xóa người dùng
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", "Người dùng đã được xóa"));
    }

    // DTO class for status update request
    public static class UpdateStatusRequest {
        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}