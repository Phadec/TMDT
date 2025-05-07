package com.example.user_service.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String username;
    private String email;
    private String currentPassword;
    private String newPassword;
}
