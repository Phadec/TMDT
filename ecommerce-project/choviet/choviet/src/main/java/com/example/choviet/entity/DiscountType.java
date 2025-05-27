package com.example.choviet.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "discount_types")
@Data
public class DiscountType {
    @Id
    private String id;
    private Type name;

    public enum Type {
        PERCENTAGE, FIXED, PRODUCT_SPECIFIC
    }
}
