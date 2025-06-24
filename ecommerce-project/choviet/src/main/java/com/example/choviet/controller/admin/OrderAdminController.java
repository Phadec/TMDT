package com.example.choviet.controller.admin;

import static com.example.choviet.config.Code.*;
import static com.example.choviet.config.api.Mid.*;
import static com.example.choviet.config.api.Prefix.*;
import static com.example.choviet.config.api.suffix.Order.*;

import com.example.choviet.dto.ApiResponse;
import com.example.choviet.dto.OrderRequest;
import com.example.choviet.entity.Order;
import com.example.choviet.service.OrderService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping(ADMIN + ORDER)
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class OrderAdminController {

    @Autowired
    OrderService orderService;

    // lấy tất cả đơn hàng
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Order>>> getOrder(@RequestParam int page, @RequestParam int size) {
        Page<Order> orders = orderService.getOrderPaging(page, size);
        ApiResponse<Page<Order>> response = new ApiResponse<>( OK, "success", orders);
        return ResponseEntity.ok(response);
    }

    @GetMapping(GET_ORDERS_BY_ID)
    public ResponseEntity<ApiResponse<Order>> getOrderById(@PathVariable String id) {
        Order order = orderService.getOrderById(id);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", order));
    }

    // lấy tất cả đơn hàng theo trạng thái
    @GetMapping(GET_ORDERS_BY_STATUS)
    public ResponseEntity<ApiResponse<Page<Order>>> getOrderByStatus(@RequestBody OrderRequest request, @RequestParam int page, @RequestParam int size){
        Page<Order> orders = orderService.getOrderByStatus(request, page, size);
        ApiResponse<Page<Order>> response = new ApiResponse<>( OK, "success", orders);
        return ResponseEntity.ok(response);
    }

    // cập nhật trạng thái đơn hàng
    @PutMapping(UPDATE_STATUS)
    public ResponseEntity<ApiResponse<Order>> updateStatus(@PathVariable String orderId, @RequestParam String status) {
        OrderRequest request = new OrderRequest();
        request.setId(orderId);
        request.setStatus(status);
        Order updatedOrder = orderService.updateStatus(request);
        ApiResponse<Order> response = new ApiResponse<>( OK, "success", updatedOrder);
        return ResponseEntity.ok(response);
    }
}
