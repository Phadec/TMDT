package com.example.choviet.entity;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "news")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class News {
    @Id
    String id;
    String title;
    String content;
    NewsCategory newsCategory;
    NewsStatus status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}