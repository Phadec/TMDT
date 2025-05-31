package com.example.choviet.entity;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "entity_types")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EntityType {
    @Id
    String id;

    String name;

    String description;
}