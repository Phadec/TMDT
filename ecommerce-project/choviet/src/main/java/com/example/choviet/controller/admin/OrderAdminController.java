package com.example.choviet.controller.admin;

import static com.example.choviet.config.Code.*;
import com.example.choviet.dto.ApiResponse;
import com.example.choviet.entity.Order;
import com.example.choviet.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/orders")
public class OrderAdminController {

    @Autowired
    private OrderService orderService;

    // lấy đơn hàng theo trang
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Order>>> getOrderPaging(@RequestParam int page, @RequestParam int size) {
        Page<Order> orders = orderService.getOrderPaging(page, size);
        ApiResponse<Page<Order>> response = new ApiResponse<>( OK, "Lấy danh sách đơn hàng thành công", orders);
        return ResponseEntity.ok(response);
    }

    // lấy đơn hàng theo khách hàng
    @PostMapping("/customer")
    public ResponseEntity<ApiResponse<Page<Order>>> getOrdersByCustomerId(@PathVariable String id, @RequestParam int page, @RequestParam int size) {
        Page<Order> orders = orderService.getOrdersByCustomerId(id, page, size);
        ApiResponse<Page<Order>> response = new ApiResponse<>( OK, "Lấy đơn hàng theo khách hàng thành công", orders);
        return ResponseEntity.ok(response);
    }

    // cập nhật trạng thái đơn hàng
    @PutMapping("/{orderId}/status")
    public ResponseEntity<ApiResponse<Order>> updateStatus(@PathVariable String orderId, @RequestParam String status) {
        Order updatedOrder = orderService.updateStatus(orderId, status);
        ApiResponse<Order> response = new ApiResponse<>( OK, "Cập nhật trạng thái đơn hàng thành công", updatedOrder);
        return ResponseEntity.ok(response);
    }
}
