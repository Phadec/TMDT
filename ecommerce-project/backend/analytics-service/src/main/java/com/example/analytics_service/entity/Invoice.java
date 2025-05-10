package com.example.analytics_service.entity;


import com.example.customer_service.entity.Customer;
import com.example.order_service.entity.InvoiceItem;
import com.example.order_service.entity.Order;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "invoices")
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @Column(name = "order_id")
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @Column(name = "customer_id")
    private Customer customer;

    @Column(nullable = false, unique = true)
    private String invoiceNumber;

    @Column(nullable = false)
    private double totalAmount;

    @Column(nullable = false)
    private double taxAmount;

    @Column(nullable = false)
    private double discountAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceStatus status;

    @Column(nullable = false)
    private LocalDateTime issuedAt;

    @Column
    private LocalDateTime dueAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "invoice", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<InvoiceItem> invoiceItems;

    public enum InvoiceStatus {
        PENDING, PAID, CANCELED
    }

    @PrePersist
    public void onCreated(){
        status = InvoiceStatus.PENDING;
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        issuedAt = LocalDateTime.now();
        dueAt = null;
    }

    @PreUpdate
    public void onUpdated(){
        updatedAt = LocalDateTime.now();
    }
}