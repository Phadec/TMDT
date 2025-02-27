package com.example.demo.repositories;

import com.example.demo.models.ShoppingCart;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ShoppingCartRepository extends MongoRepository<ShoppingCart, String> {
    long countByUserId(String userId); // Tự động tạo query đếm số sản phẩm theo userId
}
