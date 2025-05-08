package com.example.user_service.dto;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class UserEvent implements Serializable {
    private String email;
    private LocalDateTime timestamp;
    private String action;
}