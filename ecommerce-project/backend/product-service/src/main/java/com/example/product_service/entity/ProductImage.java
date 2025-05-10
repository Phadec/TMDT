package com.example.product_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_images")
@Data
public class ProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private Product product;

    @Column(nullable = false)
    private String url;

    @Column
    private boolean isPrimary;

    @Column
    private LocalDateTime createdAt;


    @PrePersist
    public void onCreate(){
        createdAt = LocalDateTime.now();
    }
}