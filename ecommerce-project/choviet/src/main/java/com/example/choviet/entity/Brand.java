package com.example.choviet.entity;


import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "brands")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Brand {
    @Id
    String id;

    String slug;

    String brandName;

    String description;

    String logoUrl;

    LocalDateTime createdAt;
}