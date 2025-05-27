package com.example.choviet.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "sizes")
@Data
public class Size {
    @Id
    private String id;

    private String name;

    private String description;
}