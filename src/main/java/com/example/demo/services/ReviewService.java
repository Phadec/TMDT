package com.example.demo.services;

import com.example.demo.dtos.ReviewInput;
import com.example.demo.dtos.ReviewUpdateInput;
import com.example.demo.models.Review;
import com.example.demo.models.Product;
import com.example.demo.models.Order;
import com.example.demo.models.OrderItem;
import com.example.demo.models.User;
import com.example.demo.repositories.ReviewRepository;
import com.example.demo.repositories.ProductRepository;
import com.example.demo.repositories.OrderRepository;
import com.example.demo.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private UserRepository userRepository;

    public List<Review> getProductReviews(String productId, Pageable pageable) {
        return reviewRepository.findByProductIdAndApprovedTrue(productId, pageable).getContent();
    }
    
    public List<Review> getProductReviews(String productId) {
        return reviewRepository.findByProductIdAndApprovedTrue(productId);
    }
    
    public List<Review> getUserReviews(String username) {
        return reviewRepository.findByUsernameAndApprovedTrue(username);
    }

    /**
     * Check if a user has purchased a product and can leave a review
     */
    public boolean canReviewProduct(String productId, String username) {
        // If the user already reviewed the product, they can't review it again
        if (reviewRepository.existsByProductIdAndUsername(productId, username)) {
            return false;
        }
        
        // Check if the user has purchased the product
        List<Order> userOrders = orderRepository.findByUsername(username);
        
        for (Order order : userOrders) {
            // Only consider completed orders
            if (!"DELIVERED".equals(order.getStatus())) {
                continue;
            }
            
            // Check if the order contains the product
            boolean containsProduct = order.getItems().stream()
                .anyMatch(item -> item.getProduct() != null && 
                                  item.getProduct().getId().equals(productId));
                                  
            if (containsProduct) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Get review statistics for a product
     */
    public Map<String, Object> getReviewSummary(String productId) {
        Map<String, Object> summary = new HashMap<>();
        
        int totalReviews = reviewRepository.countByProductId(productId);
        if (totalReviews == 0) {
            summary.put("averageRating", 0.0);
            summary.put("totalReviews", 0);
            summary.put("fiveStarCount", 0);
            summary.put("fourStarCount", 0);
            summary.put("threeStarCount", 0);
            summary.put("twoStarCount", 0);
            summary.put("oneStarCount", 0);
            return summary;
        }
        
        int fiveStarCount = reviewRepository.countByProductIdAndRating(productId, 5);
        int fourStarCount = reviewRepository.countByProductIdAndRating(productId, 4);
        int threeStarCount = reviewRepository.countByProductIdAndRating(productId, 3);
        int twoStarCount = reviewRepository.countByProductIdAndRating(productId, 2);
        int oneStarCount = reviewRepository.countByProductIdAndRating(productId, 1);
        
        double averageRating = (5 * fiveStarCount + 4 * fourStarCount + 3 * threeStarCount + 
                               2 * twoStarCount + 1 * oneStarCount) / (double) totalReviews;
        
        // Round to one decimal place
        averageRating = Math.round(averageRating * 10.0) / 10.0;
        
        summary.put("averageRating", averageRating);
        summary.put("totalReviews", totalReviews);
        summary.put("fiveStarCount", fiveStarCount);
        summary.put("fourStarCount", fourStarCount);
        summary.put("threeStarCount", threeStarCount);
        summary.put("twoStarCount", twoStarCount);
        summary.put("oneStarCount", oneStarCount);
        
        return summary;
    }
    
    @Transactional
    public Review createReview(ReviewInput input, String username) {
        // Check if the user already reviewed this product
        if (reviewRepository.existsByProductIdAndUsername(input.getProductId(), username)) {
            throw new RuntimeException("You have already reviewed this product");
        }
        
    
        // Get user information
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if the user has purchased the product
        boolean verified = false;
        String orderId = null;
        
        List<Order> userOrders = orderRepository.findByUsername(username);
        
        for (Order order : userOrders) {
            // Only consider completed orders
            if (!"DELIVERED".equals(order.getStatus())) {
                continue;
            }
            
            // Check if the order contains the product
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null && 
                    item.getProduct().getId().equals(input.getProductId())) {
                    verified = true;
                    orderId = order.getId();
                    break;
                }
            }
            
            if (verified) {
                break;
            }
        }
        
        // Create the review
        Review review = new Review();
        review.setProductId(input.getProductId());
        review.setUsername(username);
        review.setUserFullName(user.getFirstName() + " " + user.getLastName());
        review.setUserAvatar(user.getAvatar());
        review.setRating(input.getRating());
        review.setComment(input.getComment());
        review.setVerified(verified);
        review.setOrderId(orderId);
        review.setCreatedAt(LocalDateTime.now());
        
        return reviewRepository.save(review);
    }
    
    @Transactional
    public Review updateReview(String id, ReviewUpdateInput input, String username) {
        Review review = reviewRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Review not found"));
        
        // Check if the user is the owner of the review
        if (!review.getUsername().equals(username)) {
            throw new RuntimeException("You can only update your own reviews");
        }
        
        if (input.getRating() != null) {
            review.setRating(input.getRating());
        }
        
        if (input.getComment() != null) {
            review.setComment(input.getComment());
        }
        
        review.setUpdatedAt(LocalDateTime.now());
        
        return reviewRepository.save(review);
    }
    
    @Transactional
    public boolean deleteReview(String id, String username) {
        Review review = reviewRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Review not found"));
        
        // Check if the user is the owner of the review
        if (!review.getUsername().equals(username)) {
            throw new RuntimeException("You can only delete your own reviews");
        }
        
        reviewRepository.delete(review);
        return true;
    }
    
    @Transactional
    public Review respondToReview(String id, String response, String sellerUsername) {
        Review review = reviewRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Review not found"));
        
        // Verify that the seller is the owner of the product
        Product product = productRepository.findById(review.getProductId())
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (!product.getSellerUsername().equals(sellerUsername)) {
            throw new RuntimeException("You can only respond to reviews for your own products");
        }
        
        review.setSellerReply(response);
        review.setSellerReplyAt(LocalDateTime.now());
        
        return reviewRepository.save(review);
    }
    
    /**
     * Get all reviews for products sold by a specific seller
     */
    public List<Review> getSellerProductReviews(String sellerUsername) {
        // Get all products from this seller
        List<Product> sellerProducts = productRepository.findBySellerUsername(sellerUsername);
        
        if (sellerProducts.isEmpty()) {
            return List.of();
        }
        
        // Get all product IDs
        List<String> productIds = sellerProducts.stream()
            .map(Product::getId)
            .collect(Collectors.toList());
        
        // Get all reviews for these products
        return reviewRepository.findByProductIds(productIds);
    }
}
