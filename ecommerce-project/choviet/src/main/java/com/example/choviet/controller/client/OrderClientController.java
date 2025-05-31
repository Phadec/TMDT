package com.example.choviet.controller.client;

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

import static com.example.choviet.config.Code.OK;
import static com.example.choviet.config.API.Prefix.*;
import static com.example.choviet.config.API.Mid.*;
import static com.example.choviet.config.API.suffix.Order.*;
@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping(CLIENT + ORDER)
public class OrderClientController {

    @Autowired
    OrderService orderService;

    // lấy tất cả đơn hàng theo trạng thái
    @GetMapping(GET_ORDERS_BY_CUSTOMER_AND_STATUS)
    public ResponseEntity<ApiResponse<Page<Order>>> getOrderByStatus(@RequestBody OrderRequest request, @RequestParam int page, @RequestParam int size){
        Page<Order> orders = orderService.getOrderByCustomerIdAndStatus(request, page, size);
        ApiResponse<Page<Order>> response = new ApiResponse<>( OK, "Success", orders);
        return ResponseEntity.ok(response);
    }

    // lấy đơn hàng theo khách hàng
    @PostMapping(GET_ORDERS)
    public ResponseEntity<ApiResponse<Page<Order>>> getOrders(@RequestBody OrderRequest request, @RequestParam int page, @RequestParam int size) {
        Page<Order> orders = orderService.getOrdersByCustomerId(request, page, size);
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

    @GetMapping(DETAIL)
    public ResponseEntity<ApiResponse<Order>> detail(@RequestBody OrderRequest request) {
        Order order = orderService.details(request);
        ApiResponse<Order> response = new ApiResponse<>( OK, "Lấy đơn hàng thành công", order);
        return ResponseEntity.ok(response);
    }
}
