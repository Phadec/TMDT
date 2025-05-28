package com.example.choviet.dto;

import com.example.choviet.entity.Order;
import lombok.Data;

@Data
public class OrderEvent {
    private Order order;
}
