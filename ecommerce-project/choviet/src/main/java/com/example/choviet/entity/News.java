package com.example.choviet.entity;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "news")
@Data
public class News {
    @Id
    private String id;
    private String title;
    private String content;
    private NewsCategory newsCategory;
    private NewsStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}