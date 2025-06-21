package com.example.choviet.repository;

import com.example.choviet.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    /**
     * Đếm số lượng sản phẩm theo danh mục
     */
    long countByProductCategoryId(String productCategoryId);

    /**
     * Tìm sản phẩm theo danh mục
     */
    List<Product> findByProductCategoryId(String productCategoryId);

    /**
     * Tìm sản phẩm theo danh mục với phân trang
     */
    Page<Product> findByProductCategoryId(String productCategoryId, Pageable pageable);
}