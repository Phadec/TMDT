package com.example.choviet.controller;

import com.example.choviet.dto.ApiResponse;
import com.example.choviet.entity.Order;
import com.example.choviet.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // API tạo đơn hàng (POST)
    @PostMapping
    public ResponseEntity<ApiResponse<String>> createOrder(@RequestBody Order order) {
        orderService.createOrder(order);
        ApiResponse<String> response = new ApiResponse<>(200, "Đơn hàng đang được xử lý", null);
        return ResponseEntity.ok(response);
    }

    // API lấy tất cả đơn hàng (GET)
    @GetMapping
    public ResponseEntity<ApiResponse<List<Order>>> findAll() {
        List<Order> orders = orderService.findAll();
        ApiResponse<List<Order>> response = new ApiResponse<>(200, "Lấy danh sách đơn hàng thành công", orders);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<ApiResponse<Order>> detail(@PathVariable String id) {
        Order order = orderService.details(id);

        ApiResponse<Order> response = new ApiResponse<>(200, "Lấy đơn hàng thành công", order);
        return ResponseEntity.ok(response);
    }

    // API lấy đơn hàng theo ID khách hàng (GET)
    @GetMapping("/customer/{id}")
    public ResponseEntity<ApiResponse<List<Order>>> findAllByCustomerId(@PathVariable String id) {
        List<Order> orders = orderService.findAllByCustomerId(id);
        ApiResponse<List<Order>> response = new ApiResponse<>(200, "Lấy đơn hàng theo khách hàng thành công", orders);
        return ResponseEntity.ok(response);
    }

    // API cập nhật trạng thái đơn hàng (PUT)
    @PutMapping("/{orderId}/status")
    public ResponseEntity<ApiResponse<Order>> updateOrderStatus(
            @PathVariable String orderId,
            @RequestParam String status
    ) {
        try {
            Order updatedOrder = orderService.updateStatus(orderId, status);
            ApiResponse<Order> response = new ApiResponse<>(200, "Cập nhật trạng thái đơn hàng thành công", updatedOrder);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<Order> response = new ApiResponse<>(400, e.getMessage(), null);
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            ApiResponse<Order> response = new ApiResponse<>(404, "Không tìm thấy đơn hàng", null);
            return ResponseEntity.status(404).body(response);
        }
    }
}
