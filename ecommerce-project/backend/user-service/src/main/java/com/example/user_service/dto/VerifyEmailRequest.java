package com.example.user_service.dto;

import lombok.Data;

@Data
public class VerifyEmailRequest {
    private String email;
    private String token;
}
