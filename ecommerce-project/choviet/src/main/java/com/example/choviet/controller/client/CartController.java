package com.example.choviet.controller.client;

import com.example.choviet.dto.ApiResponse;
import com.example.choviet.entity.Cart;
import com.example.choviet.service.CartService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import static com.example.choviet.config.Code.OK;
import static com.example.choviet.config.api.Mid.CART;
import static com.example.choviet.config.api.Prefix.CLIENT;
import static com.example.choviet.config.api.suffix.Cart.*;

@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping(CLIENT + CART)
public class CartController {
    @Autowired
    CartService cartService;

    @PostMapping()
    public ResponseEntity<ApiResponse<String>> add(@RequestBody Cart cart){
        cartService.add(cart);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", "Thêm vào giở hàng thàng công"));
    }

    @GetMapping()
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> get(@RequestParam String id){
        List<Map<String, String>> carts = cartService.get(id);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", carts));
    }

    @DeleteMapping(DELETE)
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> delete(@RequestParam String cardId, @RequestParam String productId){
        List<Map<String, String>> newCarts = cartService.delete(cardId, productId);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", newCarts));
    }
}
