package com.example.choviet.entity;


import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "reviews")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Review {
    @Id
    String id;

    Product product;

    Customer customer;

    int rating;

    String comment;

    LocalDateTime createdAt;

}