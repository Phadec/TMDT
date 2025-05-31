package com.example.choviet.entity;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "discount_usage")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DiscountUsage {
    @Id
    String id;
    Discount discount;
    Order order;
    Customer customer;
    LocalDateTime usedAt;
}