package com.example.choviet.controller.admin;

import com.example.choviet.dto.ApiResponse;
import com.example.choviet.entity.Customer;
import com.example.choviet.service.CustomerService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.example.choviet.config.Code.*;
import static com.example.choviet.config.api.Prefix.*;

@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping(ADMIN + "/customers")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class CustomerAdminController {

    @Autowired
    CustomerService customerService;

    // Lấy tất cả khách hàng với phân trang
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Customer>>> getAllCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Customer> customers = customerService.getAllCustomersPaging(page, size);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", customers));
    }

    // Lấy khách hàng theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Customer>> getCustomerById(@PathVariable String id) {
        Customer customer = customerService.getCustomerEntityById(id);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", customer));
    }

    // Cập nhật trạng thái khách hàng
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Customer>> updateCustomerStatus(
            @PathVariable String id,
            @RequestBody UpdateStatusRequest request) {
        Customer customer = customerService.updateCustomerStatus(id, request.getStatus());
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", customer));
    }

    // Xóa khách hàng
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCustomer(@PathVariable String id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", "Khách hàng đã được xóa"));
    }

    // Đăng ký khách hàng thành người bán
    @PutMapping("/{id}/register-seller")
    public ResponseEntity<ApiResponse<Customer>> registerAsSeller(@PathVariable String id) {
        Customer customer = customerService.registerAsSellerEntity(id);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", customer));
    }

    // DTO class for status update request
    public static class UpdateStatusRequest {
        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}
