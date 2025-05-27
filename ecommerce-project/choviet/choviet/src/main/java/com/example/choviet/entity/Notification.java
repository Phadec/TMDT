package com.example.choviet.entity;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@Data
public class Notification {
    @Id
    private String id;

    private Customer customer;

    private String title;

    private String message;

    private EntityType entityType;

    private int entityId;

    private boolean isRead;

    private LocalDateTime createdAt;
}