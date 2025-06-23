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

    /**
     * Đếm số lượng sản phẩm theo seller và trạng thái
     */
    long countByCustomer_IdAndStatus(String customerId, Product.Type status);

    /**
     * Tìm sản phẩm theo seller và trạng thái
     */
    List<Product> findByCustomer_IdAndStatus(String customerId, Product.Type status);

    /**
     * Tìm sản phẩm theo seller với phân trang
     */
    Page<Product> findByCustomer_Id(String customerId, Pageable pageable);

    /**
     * Tìm sản phẩm theo seller sắp xếp theo thời gian tạo
     */
    List<Product> findByCustomer_IdOrderByCreatedAtDesc(String customerId);

    /**
     * Tìm sản phẩm theo trạng thái với phân trang
     */
    Page<Product> findByStatus(Product.Type status, Pageable pageable);

    /**
     * Tìm sản phẩm theo trạng thái
     */
    List<Product> findByStatus(Product.Type status);
}