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
    private Integer quantity; // Make sure the quantity field exists and is initialized properly

    // This field is not stored in database, it's calculated on-the-fly
    private Boolean isFavorited;

    // Custom getter for createdAt to ensure it is never null
    public Date getCreatedAt() {
        return createdAt != null ? createdAt : new Date();
    }

    // Custom getter for quantity to ensure it is never null
    public Integer getQuantity() {
        return quantity == null ? 0 : quantity;  // Ensure no null pointer exceptions
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    // Add getter and setter for isFavorited
    public Boolean getIsFavorited() {
        return isFavorited;
    }

    public void setIsFavorited(Boolean isFavorited) {
        this.isFavorited = isFavorited;
    }
}
