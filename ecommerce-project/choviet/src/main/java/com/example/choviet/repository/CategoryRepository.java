package com.example.choviet.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.choviet.entity.ProductCategory;

@Repository
public interface CategoryRepository extends MongoRepository<ProductCategory, String> {
}
