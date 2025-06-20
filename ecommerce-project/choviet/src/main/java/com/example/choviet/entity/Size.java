package com.example.choviet.entity;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "sizes")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Size {
    @Id
    String id;

    String name;

    String description;
}