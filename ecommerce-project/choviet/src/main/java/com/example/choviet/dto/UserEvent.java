package com.example.choviet.dto;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class UserEvent implements Serializable {
    private UserDto userDto;
    private LocalDateTime createdAt;
    private String action;
}