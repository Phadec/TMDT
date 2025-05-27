package com.example.choviet.entity;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
@Document(collection = "package_services")
@Data
public class PackageService {
    @Id
    private String id;
    private Customer customer;
    private String name;
}