package com.example.demo.models;

import java.time.LocalDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "cartItems")
public class CartItem {
    @Id
    private String id;
    
    private String username;
    private Product product;
    private String productId; // Add this field
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
}