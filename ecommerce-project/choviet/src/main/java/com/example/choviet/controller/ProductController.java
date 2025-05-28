package com.example.choviet.controller;

import com.example.choviet.dto.ApiResponse;
import com.example.choviet.entity.Product;
import com.example.choviet.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // Lấy tất cả sản phẩm
    @GetMapping
    public ResponseEntity<ApiResponse<List<Product>>> findAll() {
        List<Product> products = productService.findAll();

        ApiResponse<List<Product>> response = new ApiResponse<>(
                200,
                "Success",
                products
        );
        return ResponseEntity.ok(response);
    }

    // Lấy sản phẩm theo loại
    @GetMapping("/category/{id}")
    public ResponseEntity<ApiResponse<List<Product>>> findAllByCategory(@PathVariable String id) {
        List<Product> products = productService.findAllByCategory(id);


        return ResponseEntity.ok(new ApiResponse<>(
                200,
                "Success",
                products
        ));
    }

    // Lấy chi tiết sản phẩm
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> detail(@PathVariable String id) {
        Product product = productService.detail(id);
        if(product == null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ApiResponse<>(404, "Product not found", null)
            );
        }

        return ResponseEntity.ok(new ApiResponse<>(200, "Success", product));
    }

    // Cập nhật trạng thái sản phẩm
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Product>> updateStatus(@PathVariable String id, @RequestParam String status) {
        Product product = productService.updateStatus(id, status);

        if(product == null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ApiResponse<>(404, "Product not found", null)
            );
        }

        return ResponseEntity.ok(new ApiResponse<>(200, "Success", product));
    }

    // Thêm sản phẩm
    @PostMapping
    public ResponseEntity<ApiResponse<Product>> createProduct(@RequestBody Product product) {
        Product saved = productService.createProduct(product);

        return ResponseEntity.ok(new ApiResponse<>(200, "Success", saved));
    }

    // Thêm nhiều sản phẩm
    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<String>> createProducts(@RequestBody List<Product> products) {
        productService.createProducts(products);
        return ResponseEntity.ok(new ApiResponse<String>(200, "Success", "Sản phẩm đang được xử lý bất đồng bộ"));
    }
}
