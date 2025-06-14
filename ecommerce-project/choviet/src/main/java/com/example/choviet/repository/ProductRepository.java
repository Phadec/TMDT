package com.example.choviet.repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.choviet.entity.Product;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    Page<Product> findAllByProductCategoryId(String id, Pageable pageable);
}