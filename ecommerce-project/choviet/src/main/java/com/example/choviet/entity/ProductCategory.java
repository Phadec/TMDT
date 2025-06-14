package com.example.choviet.entity;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "categories")
@Builder
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductCategory {
    @Id
    @Field("category_id")
    String id;
    String name;
    LocalDateTime createdAt;
}
