package com.example.order_service.entity;

import com.example.user_service.entity.EntityType;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "discount_entities")
@Data
public class DiscountEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private Discount discount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private EntityType entityType;

    @Column(nullable = false)
    private int entityId;

    @Column
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate(){
        createdAt = LocalDateTime.now();
    }
}