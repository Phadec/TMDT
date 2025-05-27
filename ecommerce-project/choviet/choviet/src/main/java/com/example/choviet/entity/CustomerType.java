package com.example.choviet.entity;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "custom_types")
public class CustomerType {
    @Id
    private String id;
    private Type type;

    public enum Type {
        BUYER, SELLER
    }
}
