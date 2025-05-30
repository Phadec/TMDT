package com.example.choviet.dto;

import lombok.Data;

import java.util.Map;

@Data
public class CustomerRegisterRequest {
    private String email;
    private String password;
    private String fullName;
    private String phone;
    private Map<String, String> addresses;
    private boolean isSeller;
}
