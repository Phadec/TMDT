package com.example.demo.dtos;

import java.util.List;

public class OrderInput {
    private CustomerInfoInput customerInfo;
    private List<OrderItemInput> items;
    private double totalAmount;
    private double subtotal;        // Add this field
    private String paymentMethod;
    private String notes;
    private String promoCode;       // Add this field
    private double discountAmount;  // Add this field
    
    // Add getters and setters for the new fields
    public double getSubtotal() {
        return subtotal;
    }
    
    public void setSubtotal(double subtotal) {
        this.subtotal = subtotal;
    }
    
    public String getPromoCode() {
        return promoCode;
    }
    
    public void setPromoCode(String promoCode) {
        this.promoCode = promoCode;
    }
    
    public double getDiscountAmount() {
        return discountAmount;
    }
    
    public void setDiscountAmount(double discountAmount) {
        this.discountAmount = discountAmount;
    }
    
    // Keep existing getters and setters
    public CustomerInfoInput getCustomerInfo() {
        return customerInfo;
    }
    
    public void setCustomerInfo(CustomerInfoInput customerInfo) {
        this.customerInfo = customerInfo;
    }
    
    public List<OrderItemInput> getItems() {
        return items;
    }
    
    public void setItems(List<OrderItemInput> items) {
        this.items = items;
    }
    
    public double getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public String getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}
