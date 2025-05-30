package com.example.choviet.dto;

import com.example.choviet.entity.Role;
import com.example.choviet.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String userType; // "USER" or "CUSTOMER"
    private String email;
    private String fullname;
    private String phone;
    private String name;
    private Role.RoleName roleName;
    private String[] permission;
    private LocalDateTime createdAt;
}
