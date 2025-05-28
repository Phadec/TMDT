package com.example.choviet.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "product_categories")
@Data
public class ProductCategory {
    @Id
    private String id;
    private String name;
    private LocalDateTime createdAt;
}
