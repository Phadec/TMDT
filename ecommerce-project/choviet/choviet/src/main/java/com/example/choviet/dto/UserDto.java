package com.example.choviet.dto;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDto {
    private String id;
    private String email;
    private String roleName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
