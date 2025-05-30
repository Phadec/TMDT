package com.example.choviet.controller.admin;

import com.example.choviet.dto.ApiResponse;
import com.example.choviet.dto.AuthResponse;
import com.example.choviet.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.example.choviet.config.Code.OK;

@RestController
@RequestMapping("/api/v1/admin/customers")
public class CustomerAdminController {
    @Autowired
    private CustomerService customerService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AuthResponse>>> getCustomer(@RequestParam int page, @RequestParam int size) {
        Page<AuthResponse> customerDtos = customerService.getCustomerPaging(page, size);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", customerDtos));
    }
}
