package com.example.trello.models;

import java.util.Date;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Document(collection = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    private String id;
    
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50)
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50)
    private String lastName;
    
    @NotBlank(message = "Username is required")
    @Indexed(unique = true)
    private String username;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Indexed(unique = true)
    private String email;
    
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String phoneNumber;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    private String role = "USER";
    private String avatar;
    private Date createdAt = new Date();
    private Date updatedAt = new Date();
    
    private String resetPasswordToken;
    private Date resetPasswordExpires;
    private String verificationToken;
    private boolean emailVerified = false;
    private boolean enabled = true;
    private Date lastLoginAt;
    private int loginAttempts = 0;
    private Date lastLoginAttemptAt;
}
