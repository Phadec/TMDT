package com.example.product_service.entity;


import com.example.customer_service.entity.Customer;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.beans.factory.annotation.CustomAutowireConfigurer;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private Customer customer;

    @Column
    private Integer rating;

    @Column
    private String comment;

    @Column
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate(){
        createdAt = LocalDateTime.now();
    }
}
