package com.example.choviet.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user_statuses")
@Data
public class UserStatus {
    @Id
    private String id;

    private Type name;

    public enum Type {
        ACTIVE, INACTIVE, SUSPENDED
    }
}