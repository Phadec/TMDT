package com.example.choviet.entity;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "services")
@Data
public class Service {
    @Id
    private String id;

    private String name;
}