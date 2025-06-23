package com.example.choviet.dto.request;

import com.example.choviet.entity.Settings;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SettingsUpdateRequest {
    
    // Cài đặt chung
    Settings.GeneralSettings chung;
    
    // Cài đặt bài viết
    Settings.PostSettings baiviet;
    
    // Cài đặt người dùng
    Settings.UserSettings nguoidung;
    
    // Cài đặt bảo mật
    Settings.SecuritySettings baomat;
    
    // Cài đặt thanh toán
    Settings.PaymentSettings thanhtoan;
    
    // Cài đặt thông báo
    Settings.NotificationSettings thongbao;
}