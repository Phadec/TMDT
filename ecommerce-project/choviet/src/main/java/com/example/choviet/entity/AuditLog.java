package com.example.choviet.entity;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "audit_logs")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuditLog {
    @Id
    String id;

    User user;

    String action;

    EntityType entityType;

    int entityId;

    String details;

    LocalDateTime createdAt;
}