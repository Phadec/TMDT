package com.example.choviet.repository;

import com.example.choviet.entity.ProductCategory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductCategoryRepository extends MongoRepository<ProductCategory, String> {
    List<ProductCategory> findByParentIdIsNull(); // Lấy danh mục gốc
    List<ProductCategory> findByParentId(String parentId); // Lấy danh mục con
    List<ProductCategory> findByIsActive(Boolean isActive); // Lấy danh mục theo trạng thái
    List<ProductCategory> findByNameContainingIgnoreCase(String name); // Tìm kiếm theo tên
}
