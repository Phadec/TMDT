package com.example.choviet.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "users")
@Data
public class User {
    @Id
    private String id;

    private String email;

    private String password;

    private Role role;

    private Status status;
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
    public enum Status {
        ACTIVE, INACTIVE, SUSPENDED
    }
}