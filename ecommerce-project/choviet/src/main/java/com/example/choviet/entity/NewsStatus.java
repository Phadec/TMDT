package com.example.choviet.entity;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "news_statuses")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NewsStatus {
    @Id
    String id;
    Type name;

    public enum Type {
        DRAFT, PUBLISHED, ARCHIVED
    }

}
