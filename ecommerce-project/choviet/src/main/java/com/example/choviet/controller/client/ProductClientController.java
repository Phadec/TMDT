package com.example.choviet.controller.client;
import static com.example.choviet.config.API.Prefix.*;
import static com.example.choviet.config.API.Mid.*;
import static com.example.choviet.config.API.suffix.Product.*;
import com.example.choviet.dto.ApiResponse;
import com.example.choviet.entity.Product;
import com.example.choviet.service.ProductService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import static com.example.choviet.config.Code.*;
@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping(CLIENT + PRODUCT)
public class ProductClientController {
    @Autowired
    ProductService productService;

    // Lấy chi tiết sản phẩm
    @GetMapping(DETAIL)
    public ResponseEntity<ApiResponse<Product>> detail(@PathVariable String id) {
        Product product = productService.detail(id);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", product));
    }
}
