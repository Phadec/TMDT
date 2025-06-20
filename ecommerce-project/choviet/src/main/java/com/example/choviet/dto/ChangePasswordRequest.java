package com.example.choviet.dto;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChangePasswordRequest {
    String userId;
    String oldPassword;
    String newPassword;
    String reNewPassword;
    String email;
}
