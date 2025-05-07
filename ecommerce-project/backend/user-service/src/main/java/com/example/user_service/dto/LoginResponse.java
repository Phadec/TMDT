package com.example.user_service.dto;

import lombok.Data;

@Data
public class LoginResponse {
    private Long id;
    private String username;
    private String email;
    private String refreshToken;
    private String tokenType = "Bearer";
    private String roleName;
    private String[] permissions;
}