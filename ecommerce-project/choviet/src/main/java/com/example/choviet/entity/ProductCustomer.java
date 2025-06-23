package com.example.choviet.entity;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document("product_customer")
public class ProductCustomer {
    @Id
    String id;
    @Field("product_id")
    String productId;
    @Field("customer_id")
    String customerId;
}