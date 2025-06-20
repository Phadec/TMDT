package com.example.choviet.entity;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "invoice_items")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InvoiceItem {
    @Id
    String id;
    Invoice invoice;
    Product product;
    int quantity;
    int unitPrice;
    int subtotal;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}