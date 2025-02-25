package com.example.demo.dtos;

import java.util.Date;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDTO {
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
