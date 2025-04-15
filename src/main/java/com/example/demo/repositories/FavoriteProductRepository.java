package com.example.demo.repositories;

import com.example.demo.models.FavoriteProduct;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteProductRepository extends MongoRepository<FavoriteProduct, String> {
    Optional<FavoriteProduct> findByProductIdAndUsername(String productId, String username);
    List<FavoriteProduct> findByUsername(String username);
    boolean existsByProductIdAndUsername(String productId, String username);
    void deleteByProductIdAndUsername(String productId, String username);
}
