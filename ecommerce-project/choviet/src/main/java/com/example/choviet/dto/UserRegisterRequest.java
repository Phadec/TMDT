package com.example.choviet.dto;
import com.example.choviet.entity.Role;
import lombok.Data;

@Data
public class UserRegisterRequest {
    private String email;
    private String password;
    private Role.RoleName role;
}
