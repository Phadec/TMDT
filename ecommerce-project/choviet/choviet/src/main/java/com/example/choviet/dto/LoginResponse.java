package com.example.choviet.dto;
import lombok.Data;

@Data
public class LoginResponse {
    private String id;
    private String email;
    private String refreshToken;
    private String tokenType = "Bearer";
    private String roleName;
    private String[] permissions;
}