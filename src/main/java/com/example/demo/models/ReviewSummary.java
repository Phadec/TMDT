package com.example.demo.models;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewSummary {
    private String productId;
    private float averageRating;
    private int totalReviews;
    private int fiveStarCount;
    private int fourStarCount;
    private int threeStarCount;
    private int twoStarCount;
    private int oneStarCount;
}
