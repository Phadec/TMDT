package com.example.demo.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
@Data
public class ResetPasswordDTO {
    @NotBlank(message = "Token is required")
    private String token;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;

    @Override
    public String toString() {
        return "ResetPasswordDTO{" +
                "token='" + (token != null ? token.substring(0, Math.min(token.length(), 10)) + "..." : "null") + '\'' +
                ", password='[REDACTED]'" +
                ", confirmPassword='[REDACTED]'" +
                '}';
    }
}
