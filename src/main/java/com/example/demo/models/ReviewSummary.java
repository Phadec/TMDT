package com.example.demo.models;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewSummary {
    private float averageRating;
    private int totalReviews;
    private int fiveStarCount;
    private int fourStarCount;
    private int threeStarCount;
    private int twoStarCount;
    private int oneStarCount;
    
    // Additional convenience method to get a formatted average
    public String getFormattedAverage() {
        if (totalReviews == 0) {
            return "N/A";
        }
        return String.format("%.1f", averageRating);
    }
}
