package com.example.product_service.entity;
import com.example.order_service.entity.OrderItem;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "categories")
@Data
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false)
    private String categoryName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private Category parent;

    private String description;

    @Column
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "parent")
    private List<Category> subCategories;

    @OneToMany(mappedBy = "parent")
    private List<Product> products;

    @PrePersist
    public void onCreate(){
        createdAt = LocalDateTime.now();
    }
}