package com.example.choviet.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "order_items")
@Data
public class OrderItem {
    @Id
    private String id;
    private Order order;
    private ProductVariant productVariant;
    private int quantity;
    private int price;
}