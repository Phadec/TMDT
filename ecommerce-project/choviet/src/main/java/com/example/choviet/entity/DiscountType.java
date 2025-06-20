package com.example.choviet.entity;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "discount_types")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DiscountType {
    @Id
    String id;
    Type name;

    public enum Type {
        PERCENTAGE, FIXED, PRODUCT_SPECIFIC
    }
}
