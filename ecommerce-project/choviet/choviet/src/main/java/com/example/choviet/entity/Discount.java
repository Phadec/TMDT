package com.example.choviet.entity;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "discounts")
@Data
public class Discount {
    @Id
    private String id;
    private String code;
    private String description;
    private DiscountType type;
    private int discountValue;
    private int minOrderValue;
    private int maxUsage;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private boolean isActive;
    private LocalDateTime createdAt;
}