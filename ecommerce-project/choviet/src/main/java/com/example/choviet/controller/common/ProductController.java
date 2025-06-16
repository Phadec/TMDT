package com.example.choviet.controller.common;
import com.example.choviet.dto.ApiResponse;
import com.example.choviet.entity.Product;
import com.example.choviet.service.ProductService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.example.choviet.config.Code.OK;
import static com.example.choviet.config.api.Mid.*;
import static com.example.choviet.config.api.Prefix.*;
import static com.example.choviet.config.api.suffix.Product.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping(COMMON + PRODUCT)
public class ProductController {
    @Autowired
    ProductService productService;

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
}
