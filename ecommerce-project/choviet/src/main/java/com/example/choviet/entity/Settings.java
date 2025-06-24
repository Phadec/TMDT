package com.example.choviet.entity;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "settings")
public class Settings {
    
    @Id
    String id;
    
    // Cài đặt chung
    GeneralSettings chung;
    
    // Cài đặt bài viết
    PostSettings baiviet;
    
    // Cài đặt người dùng
    UserSettings nguoidung;
    
    // Cài đặt bảo mật
    SecuritySettings baomat;
    
    // Cài đặt thanh toán
    PaymentSettings thanhtoan;
    
    // Cài đặt thông báo
    NotificationSettings thongbao;
    
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class GeneralSettings {
        String siteName;
        String siteDescription;
        String contactEmail;
        String contactPhone;
        String logo;
        String favicon;
        Boolean maintenanceMode;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class PostSettings {
        Boolean requireApproval;
        Integer maxImagesPerPost;
        Integer maxPostsPerUser;
        Integer postExpiryDays;
        List<String> allowedCategories;
        List<String> bannedKeywords;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class UserSettings {
        Boolean requireEmailVerification;
        Boolean requirePhoneVerification;
        Boolean allowUserRegistration;
        String defaultUserRole;
        Boolean autoDeleteInactiveUsers;
        Integer inactiveUserDays;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class SecuritySettings {
        Boolean recaptchaEnabled;
        String recaptchaKey;
        Integer maxLoginAttempts;
        Integer lockoutTime;
        Integer passwordMinLength;
        Boolean passwordRequireSpecialChar;
        Boolean passwordRequireNumber;
        Boolean passwordRequireUppercase;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class PaymentSettings {
        String currency;
        List<String> paymentGateways;
        Long featuredPostPrice;
        Long highlightedPostPrice;
        Long urgentPostPrice;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class NotificationSettings {
        Boolean emailNotifications;
        Boolean pushNotifications;
        Boolean smsNotifications;
        String adminEmailForReports;
    }
}