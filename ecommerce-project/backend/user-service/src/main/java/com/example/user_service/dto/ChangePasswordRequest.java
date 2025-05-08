package com.example.user_service.dto;

import lombok.Data;

@Data
public class ChangePasswordRequest {
    private Long userId;
    private String oldPassword;
    private String newPassword;
    private String reNewPassword;
    private String email;
}
