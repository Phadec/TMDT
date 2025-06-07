package com.example.choviet.dto;
import com.example.choviet.entity.Role;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserRegisterRequest {
    String email;
    String password;
    Role.RoleName role; // Có thể null, mặc định sẽ là STAFF
}
