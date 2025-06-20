package com.example.choviet.dto;

import com.example.choviet.entity.Customer;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileResponse {
    String id;
    String email;
    String fullName;
    String phone;
    Customer.Status status;
    String addresses;
    boolean isSeller;
    LocalDateTime createdAt;
    LocalDateTime updateAt;
}