package com.example.notification_service.entity;
import com.example.customer_service.entity.Customer;
import com.example.user_service.entity.EntityType;
import jakarta.persistence.*;
import lombok.CustomLog;
import lombok.Data;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @Column(name = "customer_id")
    private Customer customer;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String message;

    @ManyToOne(fetch = FetchType.LAZY)
    @Column(name = "entity_type_id")
    private EntityType entityType;

    @Column
    private int entityId;

    @Column
    private boolean isRead;

    @Column
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreated(){
        createdAt = LocalDateTime.now();
        isRead = false;
    }

}