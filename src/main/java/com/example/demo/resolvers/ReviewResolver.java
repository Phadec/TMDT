package com.example.demo.resolvers;

import com.example.demo.models.Review;
import com.example.demo.models.Product;
import com.example.demo.models.ReviewSummary;
import com.example.demo.security.SecurityUtils;
import com.example.demo.dtos.ReviewInput;
import com.example.demo.dtos.ReviewUpdateInput;
import com.example.demo.services.ReviewService;
import com.example.demo.services.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.data.domain.PageRequest;

import java.util.List;

@Controller
public class ReviewResolver {

    @Autowired
    private ReviewService reviewService;
    
    @Autowired
    private ProductService productService;

    @QueryMapping
    public List<Review> productReviews(@Argument String productId, @Argument Integer page, @Argument Integer size) {
        return reviewService.getProductReviews(
            productId, 
            PageRequest.of(page != null ? page : 0, size != null ? size : 10)
        );
    }
    
    @QueryMapping
    public List<Review> userReviews(@Argument String username) {
        // Allow public access to reviews by username - no authorization check needed
        // This is safe because reviews are public data displayed on user profiles
        try {
            return reviewService.getReviewsBySellerUsername(username);
        } catch (Exception e) {
            System.err.println("Error fetching reviews for user " + username + ": " + e.getMessage());
            // Return empty list instead of throwing exception to prevent breaking the UI
            return List.of();
        }
    }
    
    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public boolean canReviewProduct(@Argument String productId) {
        String username = SecurityUtils.getCurrentUsername();
        return reviewService.canReviewProduct(productId, username);
    }
    
    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Review createReview(@Argument ReviewInput input) {
        String username = SecurityUtils.getCurrentUsername();
        return reviewService.createReview(input, username);
    }
    
    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Review updateReview(@Argument String id, @Argument ReviewUpdateInput input) {
        String username = SecurityUtils.getCurrentUsername();
        return reviewService.updateReview(id, input, username);
    }
    
    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public boolean deleteReview(@Argument String id) {
        String username = SecurityUtils.getCurrentUsername();
        return reviewService.deleteReview(id, username);
    }
    
    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Review respondToReview(@Argument String id, @Argument String response) {
        String username = SecurityUtils.getCurrentUsername();
        return reviewService.respondToReview(id, response, username);
    }
    
    @QueryMapping
    public ReviewSummary reviewSummary(@Argument String productId) {
        return reviewService.getReviewSummary(productId);
    }
    
    @SchemaMapping
    public Product product(Review review) {
        return productService.getProductById(review.getProductId());
    }
}
