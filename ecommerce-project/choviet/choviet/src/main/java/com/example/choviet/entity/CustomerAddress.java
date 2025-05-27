package com.example.choviet.entity;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "customer_addresses")
public class CustomerAddress {
    @Id
    private String id;
    private Customer customer;
    private String phone;
    private String addressLine;
    private String city;
    private String postalCode;
    private String country;
    private boolean isDefault;
    private LocalDateTime createdAt;
}