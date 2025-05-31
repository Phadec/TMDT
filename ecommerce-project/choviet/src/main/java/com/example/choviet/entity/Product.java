package com.example.choviet.entity;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.Map;
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "products")
@Data
public class Product {
    @Id
    String id;

    String name;

    String description;

    Brand brand;

    ProductCategory productCategory;
    Map<String, String> specs;
    Map<String, String> images;
    Type status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    Map<String, String> variant; // size, price, sku, createdAt

    public enum Type {
        ACTIVE, INACTIVE
    }
}