package com.example.demo.dtos;

import lombok.Data;

@Data
public class OrderItemInput {
    private String productId;
    private int quantity;
    private double price;
}
