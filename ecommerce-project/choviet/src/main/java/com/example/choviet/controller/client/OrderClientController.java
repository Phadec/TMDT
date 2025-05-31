package com.example.choviet.controller.client;

import com.example.choviet.dto.ApiResponse;
import com.example.choviet.entity.Order;
import com.example.choviet.service.OrderService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import static com.example.choviet.config.Code.OK;
@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping("/api/v1/client/orders")
public class OrderClientController {

    @Autowired
    OrderService orderService;


    // lấy tất cả đơn hàng theo trạng thái
    @GetMapping("/status/{customerId}")
    public ResponseEntity<ApiResponse<Page<Order>>> getOrderByStatus(@PathVariable String customerId, @RequestParam String status, @RequestParam int page, @RequestParam int size){
        Page<Order> orders = orderService.getOrderByCustomerIdAndStatus(customerId, status, page, size);
        ApiResponse<Page<Order>> response = new ApiResponse<>( OK, "Success", orders);
        return ResponseEntity.ok(response);
    }

    // lấy đơn hàng theo khách hàng
    @PostMapping("/{id}")
    public ResponseEntity<ApiResponse<Page<Order>>> getOrders(@PathVariable String id, @RequestParam int page, @RequestParam int size) {
        Page<Order> orders = orderService.getOrdersByCustomerId(id, page, size);
        ApiResponse<Page<Order>> response = new ApiResponse<>( OK, "Lấy đơn hàng theo khách hàng thành công", orders);
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
