package com.example.order_service.entity;


import com.example.notification_service.entity.Notification;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "discounts")
@Data
public class Discount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column
    private String description;

    @Enumerated(EnumType.STRING)
    @Column
    private Type type;

    @Column(nullable = false)
    private int discountValue;

    @Column
    private int minOrderValue;

    @Column
    private int maxUsage;

    @Column
    private LocalDateTime startDate;

    @Column
    private LocalDateTime endDate;

    @Column
    private boolean isActive;

    @Column
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "discount", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<DiscountEntity> discountEntityList;

    @OneToMany(mappedBy = "discount", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<DiscountUsage> discountUsages;

    @OneToMany(mappedBy = "discount", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Order> orders;
    public enum Type {
        PERCENTAGE, FIXED, PRODUCT_SPECIFIC
    }

    @PrePersist
    public void onCreated(){
        createdAt = LocalDateTime.now();
        isActive = true;
    }
}