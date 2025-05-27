package com.example.choviet.entity;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "payment_methods")
@Data
public class PaymentMethod {
    @Id
    private String id;

    private String name;

    private String description;
}