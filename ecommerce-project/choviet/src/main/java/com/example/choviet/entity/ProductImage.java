package com.example.choviet.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "product_images")
@Data
public class ProductImage {
    @Id
    private String id;

    private Product product;

    private String url;

    private boolean isPrimary;

    private LocalDateTime createdAt;
}