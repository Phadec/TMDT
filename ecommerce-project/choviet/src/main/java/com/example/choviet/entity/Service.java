package com.example.choviet.entity;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "services")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Service {
    @Id
    String id;

    String name;
}