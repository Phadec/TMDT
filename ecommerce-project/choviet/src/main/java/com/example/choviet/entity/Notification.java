package com.example.choviet.entity;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "notifications")
@Data
public class Notification {
    @Id
    String id;

    Customer customer;

    String title;

    String message;

    EntityType entityType;

    int entityId;

    boolean isRead;

    LocalDateTime createdAt;
}