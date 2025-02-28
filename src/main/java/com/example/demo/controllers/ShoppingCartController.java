package com.example.demo.controllers;

import com.example.demo.services.ShoppingCartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/shopping-cart")
public class ShoppingCartController {
    final ShoppingCartService shoppingCartService;

    public ShoppingCartController(ShoppingCartService shoppingCartService) {
        this.shoppingCartService = shoppingCartService;
    }

    // Lấy ra số lượng sản phẩm đang có trong giỏ hàng
    @PostMapping("/count/{username}")
    public ResponseEntity<Long> getCountOfProductsInCart(@PathVariable String username) {
        // Hàm này cần kiểm tra lại vì đang đếm không đúng
        return ResponseEntity.ok(shoppingCartService.getCountOfProducts(username));
    }

    // Lấy ra danh sách sản phẩm

    // Thêm các sản phẩm vào giỏ hàng
    @PostMapping("/add/{username}")
    public void addProducts(@PathVariable String username, @RequestBody List<String> isProducts) {
        shoppingCartService.saveProducts(username, isProducts);
    }

    // Xóa các sản phẩm khỏi giỏ hàng

    // Sửa thông tin sản phẩm trong giỏ hàng
}
