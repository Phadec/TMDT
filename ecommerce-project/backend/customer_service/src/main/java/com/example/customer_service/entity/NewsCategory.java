package com.example.customer_service.entity;

import com.example.order_service.entity.DiscountUsage;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "news_categories",
        indexes = {@Index(name = "idx_news_categories_parent_id", columnList = "parent_id")})
public class NewsCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column
    private int id;

    @Column(nullable = false)
    private String name;

    @Column
    private int parentId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "newsCategory", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<News> news;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}