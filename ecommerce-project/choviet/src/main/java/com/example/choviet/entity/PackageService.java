package com.example.choviet.entity;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
@Document(collection = "package_services")
@FieldDefaults(level = AccessLevel.PRIVATE)
@Data
public class PackageService {
    @Id
    String id;
    Customer customer;
    String name;
}