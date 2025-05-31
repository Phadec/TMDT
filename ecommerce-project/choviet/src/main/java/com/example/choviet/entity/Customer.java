package com.example.choviet.entity;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Document(collection = "customers")
public class Customer {
    @Id
    private String id;
    private String email;
    private String passwordHash;
    private String fullName;
    private String phone;
    private Status status;
    private Map<String, String> addresses;
    private boolean isSeller;
    private LocalDateTime createdAt;
    private LocalDateTime updateAt;

    public enum Status {
        ACTIVE, INACTIVE, SUSPENDED
    }
}
