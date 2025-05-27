package com.example.choviet.dto;

import lombok.Data;

@Data
public class VerifyEmailRequest {
    private String email;
    private String token;
}
