package com.example.choviet.controller.client;

import static com.example.choviet.config.Code.*;
import static com.example.choviet.config.api.Prefix.*;
import static com.example.choviet.config.api.suffix.Customer.*;

import com.example.choviet.dto.ProfileResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.choviet.dto.ApiResponse;
import com.example.choviet.dto.PersonRequest;
import com.example.choviet.service.CustomerService;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping(CLIENT + PROFILE)
public class ProfileClientController {
    
    @Autowired
    CustomerService customerService;
    
    /**
     * Endpoint để xem thông tin chi tiết của customer
     * @param request Chứa ID của customer
     * @return Thông tin chi tiết của customer
     */
    @PostMapping(VIEW)
    public ResponseEntity<ApiResponse<ProfileResponse>> getCustomerProfile(@RequestBody PersonRequest request) {
        String customerId = request.getPersonId();
        ProfileResponse profileResponse = customerService.getCustomerById(customerId);
        return ResponseEntity.ok(new ApiResponse<>(OK, "Lấy thông tin cá nhân thành công", profileResponse));
    }
    
    /**
     * Endpoint để đăng ký trở thành người bán
     * @param request Chứa ID của customer
     * @return Thông tin đã cập nhật của customer
     */
    @PostMapping(REGISTER_SELLER)
    public ResponseEntity<ApiResponse<ProfileResponse>> registerAsSeller(@RequestBody PersonRequest request) {
        String customerId = request.getPersonId();
        ProfileResponse profileResponse = customerService.registerAsSeller(customerId);
        return ResponseEntity.ok(new ApiResponse<>(OK, "Đăng ký trở thành người bán thành công", profileResponse));
    }

    /**
     * Endpoint để cập nhật thông tin khách hàng
     * @param request Chứa id, name, email, phone, address
     * @return thông báo cập nhật thành công
     */
    @PostMapping(UPDATE_PROFILE)
    public ResponseEntity<ApiResponse<String>> updateProfile(@RequestBody PersonRequest request) {
        customerService.updateProfile(request);
        return ResponseEntity.ok(new ApiResponse<>(OK, "Cập nhật thông tin thành công", ""));
    }
}
