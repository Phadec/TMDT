package com.example.choviet.controller.admin;

import com.example.choviet.dto.ApiResponse;
import com.example.choviet.dto.request.SettingsUpdateRequest;
import com.example.choviet.entity.Settings;
import com.example.choviet.service.SettingsService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.example.choviet.config.Code.*;
import static com.example.choviet.config.api.Prefix.*;
import static com.example.choviet.config.api.suffix.Settings.*;

@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping(ADMIN + SETTINGS)
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class SettingsAdminController {
    
    @Autowired
    SettingsService settingsService;
    
    /**
     * Lấy tất cả cài đặt hệ thống
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Settings>> getSettings() {
        Settings settings = settingsService.getSettings();
        return ResponseEntity.ok(new ApiResponse<>(OK, "Lấy cài đặt thành công", settings));
    }
    
    /**
     * Cập nhật cài đặt hệ thống
     */
    @PutMapping
    public ResponseEntity<ApiResponse<Settings>> updateSettings(@RequestBody SettingsUpdateRequest request) {
        Settings settings = settingsService.updateSettings(request);
        return ResponseEntity.ok(new ApiResponse<>(OK, "Cập nhật cài đặt thành công", settings));
    }
    
    /**
     * Cập nhật cài đặt chung
     */
    @PutMapping(GENERAL)
    public ResponseEntity<ApiResponse<Settings>> updateGeneralSettings(@RequestBody Settings.GeneralSettings generalSettings) {
        Settings settings = settingsService.updateGeneralSettings(generalSettings);
        return ResponseEntity.ok(new ApiResponse<>(OK, "Cập nhật cài đặt chung thành công", settings));
    }
    
    /**
     * Khôi phục cài đặt mặc định
     */
    @PostMapping(RESET)
    public ResponseEntity<ApiResponse<Settings>> resetSettings() {
        Settings settings = settingsService.resetToDefault();
        return ResponseEntity.ok(new ApiResponse<>(OK, "Khôi phục cài đặt mặc định thành công", settings));
    }
}