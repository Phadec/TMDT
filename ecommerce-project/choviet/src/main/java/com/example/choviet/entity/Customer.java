package com.example.choviet.entity;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "customers")
public class Customer {
    @Id
    private String id;
    private String username;
    private String email;
    private String passwordHash;
    private String fullName;
    private String phone;
    private CustomerStatus customerStatus;
    private CustomerType customerType;
    private CustomerAddress customerAddress;
    private int isSeller;
    private LocalDateTime createdAt;
}
