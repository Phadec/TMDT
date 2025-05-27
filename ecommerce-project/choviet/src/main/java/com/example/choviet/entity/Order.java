package com.example.choviet.entity;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "orders")
public class Order {
    @Id
    private String id;
    private Customer customer;
    private String fullName;
    private String phone;
    private CustomerAddress customerAddress;
    private String city;
    private String postalCode;
    private String country;
    private int totalAmount;
    private Discount discount;
    private OrderStatus orderStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}