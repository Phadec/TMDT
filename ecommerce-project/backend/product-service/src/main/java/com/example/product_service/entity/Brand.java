package com.example.product_service.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "brands")
@Data
public class Brand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(unique = true, nullable = false)
    private String slug;

    @Column(unique = true, nullable = false)
    private String brandName;

    @Column
    private String description;

    @Column
    private String logoUrl;

    @Column
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "brand", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Product> products;

    @PrePersist
    public void onCreate(){
        createdAt = LocalDateTime.now();
    }
}