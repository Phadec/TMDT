package com.example.choviet.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "discount_entities")
@Data
public class DiscountEntity {
    @Id
    private String id;
    private Discount discount;
    private EntityType entityType;
    private int entityId;
    private LocalDateTime createdAt;
}