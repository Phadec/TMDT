package com.example.user_service.dto;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class LoginEvent implements Serializable {
    private Long userId;
    private String email;
    private LocalDateTime timestamp;
    private String action;
}