package com.example.choviet.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "products")
@Data
public class Product {
    @Id
    private String id;

    private String name;

    private String description;

    private Brand brand;

    private ProductCategory productCategory;

    private ProductStatus productStatus;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}