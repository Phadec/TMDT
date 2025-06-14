package com.example.choviet.repository;

import com.example.choviet.entity.Product;
import com.example.choviet.entity.ProductCategory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductCategoryRepository extends MongoRepository<ProductCategory, String> {
}
