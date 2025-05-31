package com.example.choviet.entity;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "news_categories")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NewsCategory {
    @Id
    String id;
    String name;
    int parentId;
    LocalDateTime createdAt;
}