package com.example.demo.models;

import java.util.Date;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.example.demo.dtos.ReviewSummary;

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

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSZ")
    private Date createdAt = new Date();
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSZ")
    private Date updatedAt = new Date();

    private int views = 0;
    private int favorites = 0;
    private Integer quantity; // Make sure the quantity field exists and is initialized properly
    private Integer soldQuantity = 0; // Track how many units of this product have been sold

    // This field is not stored in database, it's calculated on-the-fly
    private Boolean isFavorited;

    private ReviewSummary reviewSummary;

    // Custom getter for createdAt to ensure it is never null
    public Date getCreatedAt() {
        if (createdAt == null) {
            this.createdAt = new Date();
        }
        return createdAt;
    }

    // Custom getter for quantity to ensure it is never null
    public Integer getQuantity() {
        return quantity == null ? 1 : quantity;  // Default to 1 instead of 0 to ensure products are considered in stock
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    // Custom getter for soldQuantity to ensure it is never null
    public Integer getSoldQuantity() {
        return soldQuantity == null ? 0 : soldQuantity;
    }

    public void setSoldQuantity(Integer soldQuantity) {
        this.soldQuantity = soldQuantity;
    }

    // Add getter and setter for isFavorited
    public Boolean getIsFavorited() {
        return isFavorited;
    }

    public void setIsFavorited(Boolean isFavorited) {
        this.isFavorited = isFavorited;
    }

    // Getter and setter for reviewSummary
    public ReviewSummary getReviewSummary() {
        return reviewSummary;
    }

    public void setReviewSummary(ReviewSummary reviewSummary) {
        this.reviewSummary = reviewSummary;
    }
}
