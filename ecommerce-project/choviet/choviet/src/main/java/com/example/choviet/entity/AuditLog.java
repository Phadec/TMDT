package com.example.choviet.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "audit_logs")
@Data
public class AuditLog {
    @Id
    private String id;

    private User user;

    private String action;

    private EntityType entityType;

    private int entityId;

    private String details;

    private LocalDateTime createdAt;
}