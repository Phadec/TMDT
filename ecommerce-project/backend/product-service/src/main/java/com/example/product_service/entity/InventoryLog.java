package com.example.product_service.entity;

import com.example.order_service.entity.Order;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_logs")
@Data
public class InventoryLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private ProductVariant productVariant;

    @Column(nullable = false)
    private int quantityChange;

    @Column
    private String reason;

    @Column
    private LocalDateTime createdAt;

    @Column
    private int createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private Order order;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private WarehouseTransfer warehouseTransfer;

    @PrePersist
    public void onCreate(){
        createdAt = LocalDateTime.now();
    }
}