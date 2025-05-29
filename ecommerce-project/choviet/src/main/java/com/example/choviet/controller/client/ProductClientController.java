package com.example.choviet.controller.client;

import com.example.choviet.dto.ApiResponse;
import com.example.choviet.entity.Product;
import com.example.choviet.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.example.choviet.config.Code.*;

@RestController
@RequestMapping("/api/v1/client/products")
public class ProductClientController {

    private final ProductService productService;

    @Autowired
    public ProductClientController(ProductService productService) {
        this.productService = productService;
    }

    // Lấy tất cả sản phẩm
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Product>>> getProductsPaging(@RequestParam int page, @RequestParam int size) {
        Page<Product> products = productService.getProductsPaging(page, size);

        ApiResponse<Page<Product>> response = new ApiResponse<>(
                OK,
                "Success",
                products
        );
        return ResponseEntity.ok(response);
    }

    // Lấy sản phẩm theo loại
    @GetMapping("/category/{id}")
    public ResponseEntity<ApiResponse<Page<Product>>> getProductsByCategory(@PathVariable String id, @RequestParam int page, @RequestParam int size) {
        Page<Product> products = productService.getProductsByCategory(id, page, size);

        return ResponseEntity.ok(new ApiResponse<>(
                OK,
                "Success",
                products
        ));
    }

    // Lấy chi tiết sản phẩm
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> detail(@PathVariable String id) {
        Product product = productService.detail(id);
        return ResponseEntity.ok(new ApiResponse<>( OK, "Success", product));
    }
}
