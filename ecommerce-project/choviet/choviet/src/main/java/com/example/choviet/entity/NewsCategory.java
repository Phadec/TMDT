package com.example.choviet.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "news_categories")
@Data
public class NewsCategory {
    @Id
    private String id;
    private String name;
    private int parentId;
    private LocalDateTime createdAt;
}