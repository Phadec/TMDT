package com.example.choviet.repository;

import com.example.choviet.entity.ProductImage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductImageRepository extends MongoRepository<ProductImage, String> {
    List<ProductImage> findByProductId(String productId);
    Optional<ProductImage> findFirstByProductId(String productId);
}
