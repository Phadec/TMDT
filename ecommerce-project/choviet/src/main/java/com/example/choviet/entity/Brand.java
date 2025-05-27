package com.example.choviet.entity;


import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "brands")
@Data
public class Brand {
    @Id
    private String id;

    private String slug;

    private String brandName;

    private String description;

    private String logoUrl;

    private LocalDateTime createdAt;
}