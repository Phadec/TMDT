package com.example.choviet.entity;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "categories")
@Builder
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductCategory {
    @Id
    String id;
    String name;
    String description;
    String parentId;
    String icon;
    boolean isActive;
    Long postCount; // Số lượng bài đăng trong danh mục
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    
    // Constructor mặc định
    public ProductCategory() {
        this.isActive = true;
        this.postCount = 0L;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Constructor với builder
    public ProductCategory(String id, String name, String description, String parentId, 
                          String icon, Boolean isActive, Long postCount, 
                          LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.parentId = parentId;
        this.icon = icon;
        this.isActive = isActive != null ? isActive : true;
        this.postCount = postCount != null ? postCount : 0L;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.updatedAt = updatedAt != null ? updatedAt : LocalDateTime.now();
    }
}
