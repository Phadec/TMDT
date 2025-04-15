package com.example.demo.models;

import java.util.UUID;

public class OrderItem {
    private String id;
    private Product product;
    private int quantity;
    private double price;

    public OrderItem() {
        // Generate a random ID if none is provided
        this.id = UUID.randomUUID().toString();
    }

    public OrderItem(Product product, int quantity, double price) {
        this();  // Call the default constructor to generate the ID
        this.product = product;
        this.quantity = quantity;
        this.price = price;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }
}
