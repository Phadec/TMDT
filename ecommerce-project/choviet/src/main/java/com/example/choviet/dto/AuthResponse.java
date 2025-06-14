package com.example.choviet.dto;

import com.example.choviet.entity.Role;
import com.example.choviet.entity.User;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthResponse {
    String token;
    String userType; // "USER" or "CUSTOMER"
    String id;
    String email;
    String fullname;
    String phone;
    String name;
    Role.RoleName roleName;
    String[] permission;
    LocalDateTime createdAt;
}
