package com.example.user_service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String roleName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
