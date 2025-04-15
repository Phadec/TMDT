package com.example.demo.repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.example.demo.models.Product;

public interface ProductRepository extends MongoRepository<Product, String> {
    Page<Product> findByCategoryId(String categoryId, Pageable pageable);
    Page<Product> findBySellerUsername(String username, Pageable pageable);
    
    // Add this method to get all products by seller without pagination
    List<Product> findBySellerUsername(String username);
    
    @Query("{'price': {$gte: ?0, $lte: ?1}}")
    Page<Product> findByPriceRange(double minPrice, double maxPrice, Pageable pageable);
    
    @Query("{'title': {$regex: ?0, $options: 'i'}}")
    Page<Product> searchByTitle(String keyword, Pageable pageable);
    
    List<Product> findByStatusAndSellerUsernameOrderByCreatedAtDesc(String status, String username);
    
    Page<Product> findByStatusNotIn(List<String> statuses, Pageable pageable);
    
    int countByCategoryId(String categoryId);
    
    /**
     * Count products in a category that don't have any of the specified statuses
     */
    int countByCategoryIdAndStatusNotIn(String categoryId, List<String> statuses);
}
