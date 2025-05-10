package com.example.order_service.entity;

import lombok.Data;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "order_statuses")
@Data
public class OrderStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column
    private int id;

    @Column(nullable = false, unique = true)
    private String statusName;

    @Column
    private String description;

    @OneToMany(mappedBy = "orderStatus", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Order> orders;
}