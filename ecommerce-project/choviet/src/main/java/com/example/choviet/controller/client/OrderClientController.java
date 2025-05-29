package com.example.choviet.controller.client;

import static com.example.choviet.config.Code.*;
import com.example.choviet.dto.ApiResponse;
import com.example.choviet.entity.Order;
import com.example.choviet.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/client/orders")
public class OrderClientController {

    @Autowired
    private OrderService orderService;


    // lấy tất cả đơn hàng theo trạng thái
    @GetMapping("/{customerId}")
    public ResponseEntity<ApiResponse<Page<Order>>> getOrderByStatus(@PathVariable String customerId, @RequestParam String status, @RequestParam int page, @RequestParam int size){
        Page<Order> orders = orderService.getOrderByStatus(customerId, status, page, size);
        ApiResponse<Page<Order>> response = new ApiResponse<>( OK, "Success", orders);
        return ResponseEntity.ok(response);
    }

    // API tạo đơn hàng (POST)
    @PostMapping
    public ResponseEntity<ApiResponse<String>> createOrder(@RequestBody Order order) {
        orderService.createOrder(order);
        ApiResponse<String> response = new ApiResponse<>( OK, "Đơn hàng đang được xử lý", null);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<ApiResponse<Order>> detail(@PathVariable String id) {
        Order order = orderService.details(id);
        ApiResponse<Order> response = new ApiResponse<>( OK, "Lấy đơn hàng thành công", order);
        return ResponseEntity.ok(response);
    }
}
