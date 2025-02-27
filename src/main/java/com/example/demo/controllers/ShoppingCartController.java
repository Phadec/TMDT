package com.example.demo.controllers;

import com.example.demo.services.ShoppingCartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/shopping-cart")
public class ShoppingCartController {
    final ShoppingCartService shoppingCartService;

    public ShoppingCartController(ShoppingCartService shoppingCartService) {
        this.shoppingCartService = shoppingCartService;
    }

    // Lấy ra số lượng sản phẩm đang có trong giỏ hàng
    @PostMapping("/count/{idUser}")
    public ResponseEntity<Long> getCountOfProductsInCart(@PathVariable String idUser) {
        return ResponseEntity.ok(shoppingCartService.getCountOfProducts(idUser));
    }

    // Lấy ra danh sách sản phẩm


    // Thêm các sản phẩm vào giỏ hàng

    // Xóa các sản phẩm khỏi giỏ hàng

    // Sửa thông tin sản phẩm trong giỏ hàng
}
