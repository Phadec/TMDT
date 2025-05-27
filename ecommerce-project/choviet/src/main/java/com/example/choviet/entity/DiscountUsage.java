package com.example.choviet.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "discount_usage")
@Data
public class DiscountUsage {
    @Id
    private String id;
    private Discount discount;
    private Order order;
    private Customer customer;
    private LocalDateTime usedAt;
}