package com.example.choviet.entity;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "discounts")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Discount {
    @Id
    String id;
    String code;
    String description;
    DiscountType type;
    int discountValue;
    int minOrderValue;
    int maxUsage;
    LocalDateTime startDate;
    LocalDateTime endDate;
    boolean isActive;
    LocalDateTime createdAt;
}