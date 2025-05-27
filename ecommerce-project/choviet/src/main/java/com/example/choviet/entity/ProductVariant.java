package com.example.choviet.entity;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "product_variants")
@Data
public class ProductVariant {
    @Id
    private String id;

    private Product product;

    private Size size;

    private int price;

    private String sku;

    private LocalDateTime createdAt;

}