package com.example.demo.dtos;

import java.util.List;
import lombok.Data;

@Data
public class OrderInput {
    private CustomerInfoInput customerInfo;
    private List<OrderItemInput> items;
    private double totalAmount;
    private String paymentMethod;
    private String notes;
}
