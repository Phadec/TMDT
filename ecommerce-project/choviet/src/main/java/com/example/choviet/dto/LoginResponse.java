package com.example.choviet.dto;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoginResponse {
    String id;
    String email;
    String token;
    String tokenType = "Bearer";
    String roleName;
    String[] permissions;
}