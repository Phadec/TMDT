package com.example.demo.models;

import java.util.Date;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Document(collection = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    private String id;
    private String title;
    private String description;
    private double price;
    private String categoryId;
    private String condition; // NEW, USED
    private List<String> images;
    private String location;
    private String sellerUsername;  // Changed from sellerId
    private boolean negotiable;
    private String status; // ACTIVE, SOLD, DELETED
    private Date createdAt = new Date();
    private Date updatedAt = new Date();
    private int views = 0;
    private int favorites = 0;
}
