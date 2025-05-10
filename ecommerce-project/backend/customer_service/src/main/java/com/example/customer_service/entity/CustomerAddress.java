package com.example.customer_service.entity;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "customer_addresses")
@Data
public class CustomerAddress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String addressLine;

    @Column(nullable = false)
    private String city;

    @Column
    private String postalCode;

    @Column(nullable = false)
    private String country;

    @Column
    private Boolean isDefault;

    @Column
    private LocalDateTime createdAt;

    @PrePersist
    public void onDefault(){
        isDefault = false;
        createdAt = LocalDateTime.now();
    }
}