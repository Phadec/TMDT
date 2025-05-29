package com.example.choviet.controller.admin;
import static com.example.choviet.config.Code.*;
import com.example.choviet.dto.*;
import com.example.choviet.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/customers")
public class UserAdminController {

    @Autowired
    private UserService userService;

    @GetMapping()
    public ResponseEntity<ApiResponse<Page<CustomerDto>>> getCustomerPaging(@RequestParam int page, @RequestParam int size) {
        Page<CustomerDto> customerDtos = userService.getCustomerPaging(page, size);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", customerDtos));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getCustomerById(@PathVariable String id) {
        UserDto userDto = userService.getCustomerById(id);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", userDto));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserDto>> updateStatus(@PathVariable String id, @RequestParam String status) {
        UserDto userDto = userService.updateStatus(id, status);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", userDto));
    }

}