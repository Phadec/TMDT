package com.example.choviet.dto;

import com.example.choviet.entity.Customer;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomerDto {
    private String id;
    private String email;
    private String fullName;
    private String phone;
    private Customer.Status status;
    private Map<String, String> addresses;
    private int isSeller;
    private LocalDateTime createdAt;

    public enum Status {
        ACTIVE, INACTIVE, SUSPENDED
    }
}
