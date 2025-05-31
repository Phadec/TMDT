package com.example.choviet.dto;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileUpdateRequest {
    String email;
    String currentPassword;
    String newPassword;
}
