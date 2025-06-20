package com.example.choviet.entity;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "users")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
    @Id
    String id;

    String email;

    String password;

    Role role;

    Status status;
    LocalDateTime createdAt;

    LocalDateTime updatedAt;
    public enum Status {
        ACTIVE, INACTIVE, SUSPENDED
    }
}