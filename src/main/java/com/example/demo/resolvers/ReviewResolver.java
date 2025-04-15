package com.example.demo.resolvers;

import com.example.demo.models.Review;
import com.example.demo.dtos.ReviewInput;
import com.example.demo.dtos.ReviewUpdateInput;
import com.example.demo.services.ReviewService;
import com.example.demo.utils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;

@Controller
public class ReviewResolver {

    @Autowired
    private ReviewService reviewService;

    @QueryMapping
    public List<Review> productReviews(
            @Argument String productId,
            @Argument Integer page,
            @Argument Integer size) {
        return reviewService.getProductReviews(productId, PageRequest.of(page, size));
    }
    
    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<Review> userReviews(@Argument String username) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        if (!currentUsername.equals(username)) {
            throw new RuntimeException("You can only access your own reviews");
        }
        
        return reviewService.getUserReviews(username);
    }
    
    @QueryMapping
    public Map<String, Object> reviewSummary(@Argument String productId) {
        return reviewService.getReviewSummary(productId);
    }
    
    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public boolean canReviewProduct(@Argument String productId) {
        String username = SecurityUtils.getCurrentUsername();
        return reviewService.canReviewProduct(productId, username);
    }
    
    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<Review> sellerProductReviews() {
        String username = SecurityUtils.getCurrentUsername();
        return reviewService.getSellerProductReviews(username);
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
    
    @SchemaMapping(typeName = "Product", field = "reviews")
    public List<Review> getProductReviews(com.example.demo.models.Product product) {
        return reviewService.getProductReviews(product.getId());
    }
    
    @SchemaMapping(typeName = "Product", field = "reviewSummary")
    public Map<String, Object> getProductReviewSummary(com.example.demo.models.Product product) {
        return reviewService.getReviewSummary(product.getId());
    }
}
