package com.example.demo.repositories;

import com.example.demo.models.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    Page<Review> findByProductIdAndApprovedTrue(String productId, Pageable pageable);
    
    List<Review> findByProductIdAndApprovedTrue(String productId);
    
    List<Review> findByUsernameAndApprovedTrue(String username);
    
    Optional<Review> findByProductIdAndUsername(String productId, String username);
    
    @Query(value = "{'productId': ?0}", count = true)
    int countByProductId(String productId);
    
    @Query(value = "{'productId': ?0, 'rating': ?1}", count = true)
    int countByProductIdAndRating(String productId, int rating);
    
    boolean existsByProductIdAndUsername(String productId, String username);
    
    @Query(value = "{'productId': ?0, 'username': ?1, 'verified': true}", exists = true)
    boolean existsVerifiedReviewByProductIdAndUsername(String productId, String username);
    
    // Find reviews for products sold by a specific seller
    @Query("{'productId': {$in: ?0}}")
    List<Review> findByProductIds(List<String> productIds);
}
