package com.example.choviet.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document("product_image")
@Data
public class ProductImage {
    @Id
    String id;
    @Field("product_id")
    String productId;
    @Field("image_id")
    String imageId;
}
