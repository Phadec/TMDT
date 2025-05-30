package com.example.choviet.mapper;

import com.example.choviet.dto.AuthResponse;
import com.example.choviet.entity.Customer;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {
    public AuthResponse toDto(Customer customer) {
        return new AuthResponse(

        );
    }
}
