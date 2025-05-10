package com.example.product_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "warehouse_transfers")
@Data
public class WarehouseTransfer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private Warehouse fromWarehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private Warehouse toWarehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private ProductVariant productVariant;

    @Column(nullable = false)
    private int quantity;

    @Enumerated(EnumType.STRING)
    @Column
    private Status status;

    @Column
    private String note;

    @Column
    private LocalDateTime createdAt;

    @Column
    private Integer createdBy;

    @Column
    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "warehouseTransfer", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<InventoryLog> inventoryLogs;

    public enum Status {
        PENDING, COMPLETED, CANCELED
    }

    @PrePersist
    public void onCreate(){
        createdAt = LocalDateTime.now();
    }

}