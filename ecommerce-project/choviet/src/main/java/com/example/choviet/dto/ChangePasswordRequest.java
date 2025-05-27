package com.example.choviet.dto;

import lombok.Data;

@Data
public class ChangePasswordRequest {
    private String userId;
    private String oldPassword;
    private String newPassword;
    private String reNewPassword;
    private String email;
}
