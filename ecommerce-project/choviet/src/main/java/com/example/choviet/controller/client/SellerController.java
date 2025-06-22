package com.example.choviet.controller.client;

import com.example.choviet.dto.ApiResponse;
import com.example.choviet.service.SellerService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import static com.example.choviet.config.Code.*;
import static com.example.choviet.config.api.Prefix.*;
import static com.example.choviet.config.api.suffix.Customer.*;
import static com.example.choviet.config.api.suffix.Seller.*;

@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping(CLIENT + SELLER)
public class SellerController {

    @Autowired
    SellerService sellerService;

    // Lấy thống kê tổng quan cho dashboard seller
    @GetMapping(DASHBOARD_OVERVIEW)
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSellerDashboardOverview(
            @RequestParam String sellerId) {
        Map<String, Object> overview = sellerService.getSellerOverview(sellerId);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", overview));
    }

    // Lấy danh sách sản phẩm của seller
    @GetMapping(PRODUCTS)
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSellerProducts(
            @RequestParam String sellerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> products = sellerService.getSellerProducts(sellerId, page, size);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", products));
    }

    // Lấy danh sách đơn hàng của seller
    @GetMapping(ORDERS)
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSellerOrders(
            @RequestParam String sellerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> orders = sellerService.getSellerOrders(sellerId, page, size);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", orders));
    }

    // Lấy hoạt động gần đây của seller
    @GetMapping(ACTIVITIES)
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSellerActivities(
            @RequestParam String sellerId,
            @RequestParam(defaultValue = "10") int limit) {
        Map<String, Object> activities = sellerService.getSellerActivities(sellerId, limit);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", activities));
    }
}