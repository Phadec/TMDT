package com.example.choviet.dto;

import com.example.choviet.entity.Order;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderRequest {
    String id;
    String customerId;
    String status;
}
