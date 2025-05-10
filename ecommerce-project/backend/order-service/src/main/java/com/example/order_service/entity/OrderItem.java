package com.example.order_service.entity;

import com.example.product_service.entity.ProductVariant;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "order_items")
@Data
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch =  FetchType.LAZY)
    @JoinColumn
    private Order order;

    @ManyToOne(fetch =  FetchType.LAZY)
    @JoinColumn
    private ProductVariant productVariant;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private int price;
}