package com.example.product_service.entity;
import com.example.order_service.entity.OrderItem;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "product_variants")
@Data
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private Size size;

    @Column(nullable = false)
    private int price;

    @Column(unique = true, nullable = false)
    private String sku;

    @Column
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "productVariant", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<OrderItem> orderItems;

    @OneToMany(mappedBy = "productVariant", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<InventoryLog> inventoryLogs;

    @OneToMany(mappedBy = "productVariant", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<WarehouseInventory> warehouseInventories;

    @PrePersist
    public void onCreate(){
        createdAt = LocalDateTime.now();
    }
}