package com.example.product_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "warehouses")
@Data
public class Warehouse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column
    private String city;

    @Column
    private String country;

    @Column
    private String phone;

    @Column
    private String description;

    @Column
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "warehouse", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<InventoryLog> inventoryLogs;

    @OneToMany(mappedBy = "warehouse", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<WarehouseInventory> warehouseInventories;

    @OneToMany(mappedBy = "fromWarehouse", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<WarehouseTransfer> fromWarehouse;

    @OneToMany(mappedBy = "toWarehouse", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<WarehouseTransfer> toWarehouse;


    @PrePersist
    public void onCreate(){
        createdAt = LocalDateTime.now();
    }
}