package com.example.demo.models;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "cartItems")
public class CartItem {
    @Id
    private String id;
    
    private String username;
    private Product product;
    private String productId; // Store product ID separately for lookups
    private int quantity;
    private LocalDateTime dateAdded;
    
    public CartItem() {
        this.dateAdded = LocalDateTime.now();
    }
    
    public CartItem(String username, Product product, int quantity) {
        this.username = username;
        this.product = product;
        this.productId = product.getId(); // Set the productId from the product
        this.quantity = quantity;
        this.dateAdded = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public Product getProduct() {
        return product;
    }
    
    public void setProduct(Product product) {
        this.product = product;
        if (product != null) {
            this.productId = product.getId();
        }
    }
    
    public String getProductId() {
        return productId;
    }
    
    public void setProductId(String productId) {
        this.productId = productId;
    }
    
    public int getQuantity() {
        return quantity;
    }
    
    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
    
    public LocalDateTime getDateAdded() {
        return dateAdded;
    }
    
    public void setDateAdded(LocalDateTime dateAdded) {
        this.dateAdded = dateAdded;
    }
    
    // Helper methods to access product properties directly
    public String getTitle() {
        return product != null ? product.getTitle() : null;
    }
    
    public double getPrice() {
        return product != null ? product.getPrice() : 0;
    }
    
    public List<String> getImages() {
        return product != null ? product.getImages() : null;
    }
    
    public String getCondition() {
        return product != null ? product.getCondition() : null;
    }
    
    public boolean isNegotiable() {
        return product != null && product.isNegotiable();
    }
}