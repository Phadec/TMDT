package com.example.choviet.repository;

import com.example.choviet.entity.ProductCustomer;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ProductCustomerRepository extends MongoRepository<ProductCustomer, String> {
    Optional<ProductCustomer> findByProductId(String productId);
}