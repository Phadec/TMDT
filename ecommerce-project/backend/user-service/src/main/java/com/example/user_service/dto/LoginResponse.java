package com.example.user_service.dto;

import lombok.Data;

@Data
public class LoginResponse {
    private Long id;
    private String email;
    private String token;
}