package com.example.choviet.dto;

import com.example.choviet.entity.Customer;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmailRequest {
    String email;
    String name;
    String phone;
    String title;
    String content;
}
