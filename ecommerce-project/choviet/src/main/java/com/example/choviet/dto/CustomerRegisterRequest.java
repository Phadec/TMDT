package com.example.choviet.dto;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Map;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerRegisterRequest {
    String email;
    String password;
    String fullName;
    String phone;
    List<String> addresses;
    boolean isSeller;
}
