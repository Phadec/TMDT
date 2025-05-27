package com.example.choviet.entity;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "entity_types")
@Data
public class EntityType {
    @Id
    private String id;

    private String name;

    private String description;
}