package com.example.payment_service.entity;
import com.example.order_service.entity.Order;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private Order order;

    @Column
    private int paymentMethodId;

    @Column(nullable = false)
    private int amount;

    @Column
    private String transactionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public enum PaymentStatus {
        PENDING, COMPLETED, FAILED
    }

    @PrePersist
    public void onCreate(){
        createdAt = LocalDateTime.now();
        status = PaymentStatus.PENDING;
    }



}