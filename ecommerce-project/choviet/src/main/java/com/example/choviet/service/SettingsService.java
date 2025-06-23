package com.example.choviet.service;

import com.example.choviet.dto.request.SettingsUpdateRequest;
import com.example.choviet.entity.Settings;
import com.example.choviet.exception.AppException;
import com.example.choviet.repository.SettingsRepository;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static com.example.choviet.config.ErrorConfig.SETTINGS_NOT_FOUND;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SettingsService {
    
    @Autowired
    SettingsRepository settingsRepository;
    
    /**
     * Lấy cài đặt hệ thống
     */
    public Settings getSettings() {
        return settingsRepository.findFirstByOrderByCreatedAtDesc()
                .orElseGet(this::createDefaultSettings);
    }
    
    /**
     * Cập nhật cài đặt hệ thống
     */
    public Settings updateSettings(SettingsUpdateRequest request) {
        Settings settings = settingsRepository.findFirstByOrderByCreatedAtDesc()
                .orElseGet(this::createDefaultSettings);
        
        // Cập nhật các cài đặt
        if (request.getChung() != null) {
            settings.setChung(request.getChung());
        }
        if (request.getBaiviet() != null) {
            settings.setBaiviet(request.getBaiviet());
        }
        if (request.getNguoidung() != null) {
            settings.setNguoidung(request.getNguoidung());
        }
        if (request.getBaomat() != null) {
            settings.setBaomat(request.getBaomat());
        }
        if (request.getThanhtoan() != null) {
            settings.setThanhtoan(request.getThanhtoan());
        }
        if (request.getThongbao() != null) {
            settings.setThongbao(request.getThongbao());
        }
        
        settings.setUpdatedAt(LocalDateTime.now());
        return settingsRepository.save(settings);
    }
    
    /**
     * Cập nhật cài đặt chung
     */
    public Settings updateGeneralSettings(Settings.GeneralSettings generalSettings) {
        Settings settings = settingsRepository.findFirstByOrderByCreatedAtDesc()
                .orElseGet(this::createDefaultSettings);
        
        settings.setChung(generalSettings);
        settings.setUpdatedAt(LocalDateTime.now());
        return settingsRepository.save(settings);
    }
    
    /**
     * Khôi phục cài đặt mặc định
     */
    public Settings resetToDefault() {
        // Xóa cài đặt hiện tại
        settingsRepository.deleteAll();
        
        // Tạo cài đặt mặc định mới
        return createDefaultSettings();
    }
    
    /**
     * Tạo cài đặt mặc định
     */
    private Settings createDefaultSettings() {
        Settings settings = new Settings();
        
        // Cài đặt chung mặc định
        Settings.GeneralSettings generalSettings = new Settings.GeneralSettings();
        generalSettings.setSiteName("Chợ Rao Vặt Online");
        generalSettings.setSiteDescription("Nền tảng mua bán, rao vặt trực tuyến hàng đầu Việt Nam");
        generalSettings.setContactEmail("support@example.com");
        generalSettings.setContactPhone("1900 1234");
        generalSettings.setLogo("/logo.png");
        generalSettings.setFavicon("/favicon.ico");
        generalSettings.setMaintenanceMode(false);
        settings.setChung(generalSettings);
        
        // Cài đặt bài viết mặc định
        Settings.PostSettings postSettings = new Settings.PostSettings();
        postSettings.setRequireApproval(true);
        postSettings.setMaxImagesPerPost(10);
        postSettings.setMaxPostsPerUser(20);
        postSettings.setPostExpiryDays(30);
        postSettings.setAllowedCategories(Arrays.asList(
            "Điện tử", "Thời trang", "Bất động sản", "Xe cộ", "Đồ gia dụng", "Việc làm", "Dịch vụ"
        ));
        postSettings.setBannedKeywords(Arrays.asList(
            "lừa đảo", "ma túy", "vũ khí", "cờ bạc"
        ));
        settings.setBaiviet(postSettings);
        
        // Cài đặt người dùng mặc định
        Settings.UserSettings userSettings = new Settings.UserSettings();
        userSettings.setRequireEmailVerification(true);
        userSettings.setRequirePhoneVerification(true);
        userSettings.setAllowUserRegistration(true);
        userSettings.setDefaultUserRole("user");
        userSettings.setAutoDeleteInactiveUsers(false);
        userSettings.setInactiveUserDays(365);
        settings.setNguoidung(userSettings);
        
        // Cài đặt bảo mật mặc định
        Settings.SecuritySettings securitySettings = new Settings.SecuritySettings();
        securitySettings.setRecaptchaEnabled(true);
        securitySettings.setRecaptchaKey("6LcXXXXXXXXXXXXXXXXXXXXX");
        securitySettings.setMaxLoginAttempts(5);
        securitySettings.setLockoutTime(30);
        securitySettings.setPasswordMinLength(8);
        securitySettings.setPasswordRequireSpecialChar(true);
        securitySettings.setPasswordRequireNumber(true);
        securitySettings.setPasswordRequireUppercase(true);
        settings.setBaomat(securitySettings);
        
        // Cài đặt thanh toán mặc định
        Settings.PaymentSettings paymentSettings = new Settings.PaymentSettings();
        paymentSettings.setCurrency("VND");
        paymentSettings.setPaymentGateways(Arrays.asList("VNPay", "MoMo", "ZaloPay", "Banking"));
        paymentSettings.setFeaturedPostPrice(50000L);
        paymentSettings.setHighlightedPostPrice(30000L);
        paymentSettings.setUrgentPostPrice(40000L);
        settings.setThanhtoan(paymentSettings);
        
        // Cài đặt thông báo mặc định
        Settings.NotificationSettings notificationSettings = new Settings.NotificationSettings();
        notificationSettings.setEmailNotifications(true);
        notificationSettings.setPushNotifications(true);
        notificationSettings.setSmsNotifications(false);
        notificationSettings.setAdminEmailForReports("admin@example.com");
        settings.setThongbao(notificationSettings);
        
        settings.setCreatedAt(LocalDateTime.now());
        settings.setUpdatedAt(LocalDateTime.now());
        
        return settingsRepository.save(settings);
    }
}