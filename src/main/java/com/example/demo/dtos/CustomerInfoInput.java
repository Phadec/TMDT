package com.example.demo.dtos;

import lombok.Data;

@Data
public class CustomerInfoInput {
    private String fullName;
    private String email;
    private String phone;
    private String address;
}
