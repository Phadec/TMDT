package com.example.choviet.service;

import com.example.choviet.entity.Product;
import com.example.choviet.repository.ProductRepository;
import com.example.choviet.transformer.ProductTransformer;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * Dịch vụ tìm kiếm sản phẩm tương tự dựa trên mô hình transformer
 */
@FieldDefaults(level = AccessLevel.PRIVATE)
@Service
public class SimilarProductService {
    
    @Autowired
    ProductRepository productRepository;
    
    @Autowired
    ProductTransformer productTransformer;
    
    @Autowired
    ProductService productService;
    
    private static final int DEFAULT_SIMILAR_PRODUCT_COUNT = 5;
    private static final int MAX_CANDIDATE_PRODUCTS = 100;
    
    /**
     * Tìm các sản phẩm tương tự với sản phẩm có ID cho trước
     * @param productId ID của sản phẩm cần tìm tương tự
     * @param limit Số lượng sản phẩm tương tự cần trả về
     * @return Danh sách sản phẩm tương tự
     */
    @Cacheable(value = "similarProducts", key = "#productId + '-' + #limit")
    public List<Product> findSimilarProducts(String productId, int limit) {
        // Lấy thông tin sản phẩm
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            return Collections.emptyList();
        }
        
        Product product = productOpt.get();
        
        // Lấy danh sách sản phẩm ứng viên (cùng danh mục nếu có)
        List<Product> candidates;
        if (product.getCategoryId() != null) {
            // Lấy sản phẩm cùng danh mục
            candidates = productRepository.findAllByProductCategoryId(
                    product.getCategoryId(), 
                    PageRequest.of(0, MAX_CANDIDATE_PRODUCTS)
            ).getContent();
        } else {
            // Lấy tất cả sản phẩm
            candidates = productRepository.findAll(
                    PageRequest.of(0, MAX_CANDIDATE_PRODUCTS)
            ).getContent();
        }
        
        // Làm phong phú thông tin sản phẩm
        candidates.forEach(candidate -> {
            if (candidate.getId().equals(product.getId())) {
                return;
            }
            
            // Thêm thông tin chi tiết cho sản phẩm ứng viên
            try {
                Product enriched = productService.detail(candidate.getId());
                candidate.setProductCategory(enriched.getProductCategory());
                candidate.setImages(enriched.getImages());
                candidate.setImageReview(enriched.getImageReview());
                candidate.setCustomer(enriched.getCustomer());
            } catch (Exception e) {
                // Bỏ qua nếu không thể làm phong phú
            }
        });
        
        // Tìm sản phẩm tương tự
        int actualLimit = (limit <= 0) ? DEFAULT_SIMILAR_PRODUCT_COUNT : limit;
        return productTransformer.findSimilarProducts(product, candidates, actualLimit);
    }
    
    /**
     * Tìm các sản phẩm tương tự với sản phẩm có ID cho trước, sử dụng số lượng mặc định
     * @param productId ID của sản phẩm cần tìm tương tự
     * @return Danh sách sản phẩm tương tự
     */
    public List<Product> findSimilarProducts(String productId) {
        return findSimilarProducts(productId, DEFAULT_SIMILAR_PRODUCT_COUNT);
    }
    
    /**
     * Xóa cache cho một sản phẩm
     * @param productId ID của sản phẩm cần xóa cache
     */
    public void invalidateCache(String productId) {
        productTransformer.invalidateCache(productId);
    }
}