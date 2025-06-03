package com.example.choviet.controller.admin;

import com.example.choviet.dto.ApiResponse;
import com.example.choviet.entity.Product;
import com.example.choviet.service.ProductService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.example.choviet.config.Code.*;
import static com.example.choviet.config.api.Mid.*;
import static com.example.choviet.config.api.Prefix.*;
import static com.example.choviet.config.api.suffix.Product.*;
@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping(ADMIN + PRODUCT)
public class ProductAdminController {

    final ProductService productService;

    @Autowired
    public ProductAdminController(ProductService productService) {
        this.productService = productService;
    }

    // Cập nhật trạng thái sản phẩm
    @PutMapping(UPDATE_STATUS)
    public ResponseEntity<ApiResponse<Product>> updateStatus(@PathVariable String id, @RequestParam String status) {
        Product product = productService.updateStatus(id, status);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", product));
    }

    // Thêm sản phẩm
    @PostMapping
    public ResponseEntity<ApiResponse<Product>> createProduct(@RequestBody Product product) {
        Product saved = productService.createProduct(product);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", saved));
    }

    // Thêm nhiều sản phẩm
    @PostMapping(CREATE_PRODUCTS)
    public ResponseEntity<ApiResponse<String>> createProducts(@RequestBody List<Product> products) {
        productService.createProducts(products);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", "Sản phẩm đang được xử lý bất đồng bộ"));
    }
}
