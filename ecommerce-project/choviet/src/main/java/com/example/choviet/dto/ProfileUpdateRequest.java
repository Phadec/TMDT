package com.example.choviet.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String email;
    private String currentPassword;
    private String newPassword;
}
