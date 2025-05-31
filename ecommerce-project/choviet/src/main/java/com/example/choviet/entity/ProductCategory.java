package com.example.choviet.entity;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "product_categories")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductCategory {
    @Id
    String id;
    String name;
    LocalDateTime createdAt;
}
