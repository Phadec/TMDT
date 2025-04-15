package com.example.demo.repositories;

import com.example.demo.models.CartItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends MongoRepository<CartItem, String> {
    List<CartItem> findByUsername(String username);
    Optional<CartItem> findByUsernameAndProductId(String username, String productId);
    void deleteByUsernameAndProductId(String username, String productId);
    void deleteByUsername(String username);
    long countByUsername(String username);
}