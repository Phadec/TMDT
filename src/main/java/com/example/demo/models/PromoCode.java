package com.example.demo.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "promoCodes")
public class PromoCode {
    @Id
    private String id;
    private String code;
    private String description;
    private double discountAmount; // Fixed amount discount
    private double discountPercent; // Percentage discount (0-100)
    private double minimumPurchase; // Minimum purchase amount to apply
    private Date validFrom;
    private Date validTo;
    private int usageLimit; // Maximum number of times it can be used
    private int usageCount; // Current usage count
    private boolean isActive;
    
    public PromoCode() {
        this.usageCount = 0;
        this.isActive = true;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public double getDiscountAmount() {
        return discountAmount;
    }
    
    public void setDiscountAmount(double discountAmount) {
        this.discountAmount = discountAmount;
    }
    
    public double getDiscountPercent() {
        return discountPercent;
    }
    
    public void setDiscountPercent(double discountPercent) {
        this.discountPercent = discountPercent;
    }
    
    public double getMinimumPurchase() {
        return minimumPurchase;
    }
    
    public void setMinimumPurchase(double minimumPurchase) {
        this.minimumPurchase = minimumPurchase;
    }
    
    public Date getValidFrom() {
        return validFrom;
    }
    
    public void setValidFrom(Date validFrom) {
        this.validFrom = validFrom;
    }
    
    public Date getValidTo() {
        return validTo;
    }
    
    public void setValidTo(Date validTo) {
        this.validTo = validTo;
    }
    
    public int getUsageLimit() {
        return usageLimit;
    }
    
    public void setUsageLimit(int usageLimit) {
        this.usageLimit = usageLimit;
    }
    
    public int getUsageCount() {
        return usageCount;
    }
    
    public void setUsageCount(int usageCount) {
        this.usageCount = usageCount;
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setActive(boolean active) {
        isActive = active;
    }
    
    // Increment usage count
    public void incrementUsage() {
        this.usageCount++;
    }
    
    // Check if promo code is valid (within date range and not exceeding usage limit)
    public boolean isValid() {
        Date now = new Date();
        return isActive 
            && (validFrom == null || now.after(validFrom)) 
            && (validTo == null || now.before(validTo))
            && (usageLimit == 0 || usageCount < usageLimit);
    }
    
    // Calculate discount for a given cart total
    public double calculateDiscount(double cartTotal) {
        if (cartTotal < minimumPurchase) {
            return 0;
        }
        
        // Calculate discount based on percentage of total cart value
        if (discountPercent > 0) {
            double percentDiscount = cartTotal * (discountPercent / 100.0);
            
            // If there's also a maximum discount amount specified, use that as a cap
            if (discountAmount > 0) {
                return Math.min(percentDiscount, discountAmount);
            }
            return percentDiscount;
        }
        
        // Or use a fixed discount amount
        if (discountAmount > 0) {
            return Math.min(discountAmount, cartTotal); // Don't exceed cart total
        }
        
        return 0;
    }
}
