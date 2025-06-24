package com.example.choviet.controller.admin;

import static com.example.choviet.config.Code.*;
import static com.example.choviet.config.api.Prefix.*;

import com.example.choviet.dto.ApiResponse;
import com.example.choviet.entity.Order;
import com.example.choviet.service.OrderService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping(ADMIN + "/analytics")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class AnalyticsAdminController {

    @Autowired
    OrderService orderService;

    // Lấy dữ liệu phân tích tài chính
    @GetMapping("/financial")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFinancialData(
            @RequestParam(defaultValue = "month") String dateRange,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        try {
            // Lấy tất cả orders để tính toán
            Page<Order> ordersPage = orderService.getOrderPaging(0, 10000); // Lấy nhiều orders
            List<Order> orders = ordersPage.getContent();
            
            // Tính toán dữ liệu tài chính
            Map<String, Object> financialData = calculateFinancialData(orders, dateRange, startDate, endDate);
            
            ApiResponse<Map<String, Object>> response = new ApiResponse<>(OK, "success", financialData);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorData = new HashMap<>();
            errorData.put("error", "Unable to fetch financial data");
            ApiResponse<Map<String, Object>> response = new ApiResponse<>(500, e.getMessage(), errorData);
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // Lấy danh sách giao dịch
    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "month") String dateRange,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        try {
            // Lấy orders với phân trang
            Page<Order> ordersPage = orderService.getOrderPaging(page, size);
            List<Order> orders = ordersPage.getContent();
            
            // Chuyển đổi orders thành transactions
            List<Map<String, Object>> transactions = orders.stream()
                .map(this::convertOrderToTransaction)
                .collect(Collectors.toList());
            
            Map<String, Object> result = new HashMap<>();
            result.put("content", transactions);
            result.put("totalElements", ordersPage.getTotalElements());
            result.put("totalPages", ordersPage.getTotalPages());
            result.put("currentPage", page);
            result.put("size", size);
            
            ApiResponse<Map<String, Object>> response = new ApiResponse<>(OK, "success", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorData = new HashMap<>();
            errorData.put("error", "Unable to fetch transactions");
            ApiResponse<Map<String, Object>> response = new ApiResponse<>(500, e.getMessage(), errorData);
            return ResponseEntity.internalServerError().body(response);
        }
    }

    private Map<String, Object> calculateFinancialData(List<Order> orders, String dateRange, String startDate, String endDate) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime today = now.toLocalDate().atStartOfDay();
        LocalDateTime thisMonth = now.withDayOfMonth(1).toLocalDate().atStartOfDay();
        
        long totalRevenue = 0;
        long monthlyRevenue = 0;
        long dailyRevenue = 0;
        Map<String, Long> revenueByMonth = new HashMap<>();
        Map<String, Long> revenueByCategory = new HashMap<>();
        List<Map<String, Object>> transactions = new ArrayList<>();
        
        for (Order order : orders) {
            if (order.getCreatedAt() == null) continue;
            
            long amount = order.getFee();
            LocalDateTime orderDate = order.getCreatedAt();
            
            // Tổng doanh thu
            totalRevenue += amount;
            
            // Doanh thu tháng này
            if (orderDate.isAfter(thisMonth) || orderDate.isEqual(thisMonth)) {
                monthlyRevenue += amount;
            }
            
            // Doanh thu hôm nay
            if (orderDate.isAfter(today) || orderDate.isEqual(today)) {
                dailyRevenue += amount;
            }
            
            // Doanh thu theo tháng
            String monthKey = String.format("%02d", orderDate.getMonthValue());
            revenueByMonth.put(monthKey, revenueByMonth.getOrDefault(monthKey, 0L) + amount);
            
            // Tạo transaction từ order
            transactions.add(convertOrderToTransaction(order));
        }
        
        // Phân loại doanh thu theo category
        revenueByCategory.put("orders", totalRevenue);
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalRevenue", totalRevenue);
        result.put("monthlyRevenue", monthlyRevenue);
        result.put("dailyRevenue", dailyRevenue);
        result.put("transactions", transactions.stream().limit(20).collect(Collectors.toList()));
        result.put("revenueByCategory", revenueByCategory);
        result.put("revenueByMonth", revenueByMonth);
        
        return result;
    }
    
    private Map<String, Object> convertOrderToTransaction(Order order) {
        Map<String, Object> transaction = new HashMap<>();
        transaction.put("id", order.getId());
        transaction.put("userId", order.getCustomer() != null ? order.getCustomer().getId() : null);
        transaction.put("userName", order.getFullName() != null ? order.getFullName() : 
                       (order.getCustomer() != null ? order.getCustomer().getFullName() : "Khách hàng ẩn danh"));
        transaction.put("amount", order.getFee());
        transaction.put("type", "order");
        transaction.put("status", mapOrderStatusToTransactionStatus(order.getStatus()));
        transaction.put("paymentMethod", order.getPayment() != null ? 
                       order.getPayment().getOrDefault("method", order.getPayment().getOrDefault("transaction", "COD")) : "COD");
        transaction.put("createdAt", order.getCreatedAt());
        return transaction;
    }
    
    private String mapOrderStatusToTransactionStatus(Order.Status orderStatus) {
        if (orderStatus == null) return "pending";
        
        switch (orderStatus) {
            case DELIVERED:
                return "completed";
            case READY_TO_PICK:
            case PICKING:
            case PICKED:
            case STORING:
            case TRANSPORTING:
            case DELIVERING:
                return "pending";
            case CANCEL:
            case DELIVERY_FAIL:
            case RETURN_FAIL:
                return "failed";
            default:
                return "pending";
        }
    }
}