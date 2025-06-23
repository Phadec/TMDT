package com.example.choviet.entity;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Document(collection = "customers")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Customer {
    @Id
    String id;
    String email;
    String passwordHash;
    String fullName;
    String phone;
    Status status;
    List<String> addresses;
    boolean isSeller;
    
    LocalDateTime createdAt;
    LocalDateTime updateAt;

    public enum Status {
        ACTIVE, INACTIVE, SUSPENDED
    }
}
