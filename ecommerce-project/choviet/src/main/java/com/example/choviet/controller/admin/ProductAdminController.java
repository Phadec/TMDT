package com.example.choviet.controller.admin;

import com.example.choviet.dto.ApiResponse;
import com.example.choviet.entity.Product;
import com.example.choviet.service.ProductService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
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
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class ProductAdminController {

    final ProductService productService;

    @Autowired
    public ProductAdminController(ProductService productService) {
        this.productService = productService;
    }

    // Lấy tất cả sản phẩm với phân trang
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Product>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Product> products = productService.getAllProductsPaging(page, size);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", products));
    }    // Lấy sản phẩm theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> getProductById(@PathVariable String id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", product));
    }

    // Thêm sản phẩm
    @PostMapping
    public ResponseEntity<ApiResponse<Product>> createProduct(@RequestBody Product product) {
        Product saved = productService.createProduct(product);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", saved));
    }

    // Thêm nhiều sản phẩm
    @PostMapping(CREATE_PRODUCTS)
    public ResponseEntity<ApiResponse<String>> createProducts(@RequestBody List<Product> products) {
        productService.createProducts(products);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", "Sản phẩm đang được xử lý bất đồng bộ"));
    }

    // Cập nhật sản phẩm
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> updateProduct(@PathVariable String id, @RequestBody Product product) {
        Product updated = productService.updateProduct(id, product);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", updated));
    }

    // Xóa sản phẩm
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", "Sản phẩm đã được xóa"));
    }
}
