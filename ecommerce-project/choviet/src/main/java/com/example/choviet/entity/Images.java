package com.example.choviet.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("images")
@Data
public class Images {
    @Id
    String id;
    String image;
}
