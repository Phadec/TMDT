package com.example.choviet.entity;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "products")
@Data
public class Product {
    @Id
    String id;
    String name;
    @Field("des_02")
    String description;
    @Field("des_01")
    String shortDes;
    @Field("category_id")    
    String categoryId;
    String price;
    String imageReview;
    List<String> images;

    Brand brand;
    ProductCategory productCategory;
    Map<String, String> specs;
    Type status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    Map<String, String> variant; // size, price, sku, createdAt

    public enum Type {
        ACTIVE, INACTIVE
    }

    public void addImage(String image) {
        if (images == null) {
            images = List.of(image);
        } else {
            images.add(image);
        }
    }
}