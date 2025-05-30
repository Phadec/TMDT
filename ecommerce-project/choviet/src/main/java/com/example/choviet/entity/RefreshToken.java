package com.example.choviet.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDateTime;

@Document(collection = "refresh_tokens")
@Data
@NoArgsConstructor
public class RefreshToken {
    @Id
    private String id;

    private String token;

    private Instant expiryDate;

    private User user;
    private Customer customer;

    private boolean valid;

    private LocalDateTime createdAt;

}