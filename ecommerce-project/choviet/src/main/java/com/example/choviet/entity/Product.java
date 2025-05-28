package com.example.choviet.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "products")
@Data
public class Product {
    @Id
    private String id;

    private String name;

    private String description;

    private Brand brand;

    private ProductCategory productCategory;
    private Map<String, String> specs;
    private Map<String, String> images;
    private Type status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Map<String, String> variant; // size, price, sku, createdAt

    public enum Type {
        ACTIVE, INACTIVE
    }
}