package com.example.choviet.controller.common;
import com.example.choviet.dto.ApiResponse;
import com.example.choviet.dto.ReviewResponse;
import com.example.choviet.entity.Product;
import com.example.choviet.service.ProductService;
import com.example.choviet.service.ReviewService;
import com.example.choviet.service.SimilarProductService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.example.choviet.config.api.Prefix.COMMON;
import static com.example.choviet.config.Code.OK;
import static com.example.choviet.config.api.Mid.*;
import static com.example.choviet.config.api.suffix.Product.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping(COMMON + PRODUCT)
public class ProductController {
    @Autowired
    ProductService productService;
    
    @Autowired
    SimilarProductService similarProductService;
    
    @Autowired
    ReviewService reviewService;

    // Lấy tất cả sản phẩm
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Product>>> getProducts(@RequestParam int page, @RequestParam int size) {
        Page<Product> products = productService.getProductsPaging(page, size);

        ApiResponse<Page<Product>> response = new ApiResponse<>(
                OK,
                "success",
                products
        );
        return ResponseEntity.ok(response);
    }

    // Lấy chi tiết sản phẩm
    @GetMapping(DETAIL)
    public ResponseEntity<ApiResponse<Product>> getProductDetail(@PathVariable String id) {
        Product product = productService.detail(id);
        
        ApiResponse<Product> response = new ApiResponse<>(
                OK,
                "success",
                product
        );
        return ResponseEntity.ok(response);
    }
    
    // Lấy sản phẩm tương tự
    @GetMapping(SIMILAR_PRODUCTS)
    public ResponseEntity<ApiResponse<List<Product>>> getSimilarProducts(
            @PathVariable String id,
            @RequestParam(required = false, defaultValue = "5") int limit) {
        
        List<Product> similarProducts = similarProductService.findSimilarProducts(id, limit);
        
        ApiResponse<List<Product>> response = new ApiResponse<>(
                OK,
                "success",
                similarProducts
        );
        return ResponseEntity.ok(response);
    }

    // Lấy sản phẩm theo loại
    @GetMapping(GET_PRODUCTS_BY_CATEGORY)
    public ResponseEntity<ApiResponse<Page<Product>>> getProductsByCategory(@PathVariable String id, @RequestParam int page, @RequestParam int size) {
        Page<Product> products = productService.getProductsByCategory(id, page, size);

        return ResponseEntity.ok(new ApiResponse<>(
                OK,
                "success",
                products
        ));
    }
    
    // Lấy đánh giá của sản phẩm
    @GetMapping(REVIEWS)
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getProductReviews(
            @PathVariable String id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<ReviewResponse> reviews = reviewService.getReviewsByProductId(id, page, size);
        
        ApiResponse<Page<ReviewResponse>> response = new ApiResponse<>(
                OK,
                "success",
                reviews
        );
        return ResponseEntity.ok(response);
    }
}
