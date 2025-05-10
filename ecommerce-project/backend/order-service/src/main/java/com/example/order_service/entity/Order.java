package com.example.order_service.entity;
import com.example.analytics_service.entity.Invoice;
import com.example.customer_service.entity.Customer;
import com.example.payment_service.entity.Payment;
import com.example.product_service.entity.InventoryLog;
import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "orders",
        indexes = {
                @Index(name = "idx_orders_customer_id", columnList = "customer_id"),
                @Index(name = "idx_orders_status_id", columnList = "status_id"),
                @Index(name = "indk_orders_address_id", columnList = "address_id")
        })
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private Customer customer;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String city;

    @Column
    private String postalCode;

    @Column(nullable = false)
    private String country;

    @Column(nullable = false)
    private int totalAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private Discount discount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private OrderStatus orderStatus;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<DiscountUsage> discountUsages;

    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Invoice> invoices;

    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<OrderItem> orderItems;

    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Payment> payments;

    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<InventoryLog> inventoryLogs;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}