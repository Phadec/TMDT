package com.example.order_service.entity;

import com.example.customer_service.entity.Customer;
import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "discount_usage",
        indexes = {@Index(name = "idx_discount_usage_discount", columnList = "discount_id")})
@Data
public class DiscountUsage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private Discount discount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private Customer customer;

    @Column(nullable = false)
    private LocalDateTime usedAt;

    @PrePersist
    protected void onCreate() {
        usedAt = LocalDateTime.now();
    }
}