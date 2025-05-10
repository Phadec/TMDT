package com.example.search_service.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Data
@Document(indexName = "products")
public class ProductSearch {
    @Id
    private int id;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String name;

    @Field(type = FieldType.Text)
    private String description;

    @Field(type = FieldType.Long)
    private Long brandId;

    @Field(type = FieldType.Long)
    private Long categoryId;

    @Field(type = FieldType.Double)
    private Double price;

    @Field(type = FieldType.Text)
    private String sku;
}