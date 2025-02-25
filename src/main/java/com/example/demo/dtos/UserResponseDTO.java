package com.example.demo.dtos;

import lombok.Data;
import java.util.Date;

@Data
public class UserResponseDTO {
    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String avatar;
    private String role;
    private boolean emailVerified;
    private boolean enabled;
    private Date lastLoginAt;
    private Date createdAt;
    private Date updatedAt;
}
