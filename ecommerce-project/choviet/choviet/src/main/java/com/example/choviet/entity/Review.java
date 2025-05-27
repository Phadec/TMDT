package com.example.choviet.entity;


import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "reviews")
@Data
public class Review {
    @Id
    private String id;

    private Product product;

    private Customer customer;

    private int rating;

    private String comment;

    private LocalDateTime createdAt;

}