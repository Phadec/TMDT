package com.example.choviet.mapper;

import com.example.choviet.dto.CustomerDto;
import com.example.choviet.entity.Customer;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {
    public CustomerDto toDto(Customer customer) {
        return new CustomerDto(

        );
    }
}
