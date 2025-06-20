package com.example.choviet.entity;


import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "reviews")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Review {
    @Id
    String id;
    @Field("product_id")
    String productId;
    @Field("customer_id")
    String customerId;
    String content;
    int rating;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}