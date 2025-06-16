package com.example.choviet.service;

import com.example.choviet.dto.ReviewResponse;
import com.example.choviet.entity.Customer;
import com.example.choviet.entity.Review;
import com.example.choviet.repository.CustomerRepository;
import com.example.choviet.repository.ReviewRepository;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewService {
    
    @Autowired
    ReviewRepository reviewRepository;
    
    @Autowired
    CustomerRepository customerRepository;
    
    @Autowired
    PagingService pagingService;
    
    /**
     * Get reviews for a product with customer names
     * @param productId the product ID
     * @param page page number
     * @param size page size
     * @return Page of ReviewResponse with customer names
     */
    public Page<ReviewResponse> getReviewsByProductId(String productId, int page, int size) {
        Pageable pageable = pagingService.createPageable(page, size);
        Page<Review> reviews = reviewRepository.findByProductId(productId, pageable);
        
        if (page > reviews.getTotalPages() && reviews.getTotalPages() > 0) {
            pageable = pagingService.createPageable(reviews.getTotalPages() - 1, size);
            reviews = reviewRepository.findByProductId(productId, pageable);
        }
        
        List<ReviewResponse> reviewResponses = new ArrayList<>();
        
        for (Review review : reviews.getContent()) {
            ReviewResponse response = mapToReviewResponse(review);
            reviewResponses.add(response);
        }
        
        return new PageImpl<>(reviewResponses, pageable, reviews.getTotalElements());
    }
    
    /**
     * Maps a Review entity to a ReviewResponse DTO with customer name
     * @param review the Review entity
     * @return ReviewResponse with customer name
     */
    private ReviewResponse mapToReviewResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setProductId(review.getProductId());
        response.setCustomerId(review.getCustomerId());
        response.setContent(review.getContent());
        response.setRating(review.getRating());
        response.setCreatedAt(review.getCreatedAt());
        response.setUpdatedAt(review.getUpdatedAt());
        
        // Get customer name
        Optional<Customer> customerOpt = customerRepository.findById(review.getCustomerId());
        customerOpt.ifPresent(customer -> response.setCustomerName(customer.getFullName()));
        
        return response;
    }
}