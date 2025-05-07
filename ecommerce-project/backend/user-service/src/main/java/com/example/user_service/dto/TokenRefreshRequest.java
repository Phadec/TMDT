package com.example.user_service.dto;

import lombok.Data;

@Data
public class TokenRefreshRequest {
    private String refreshToken;
}
