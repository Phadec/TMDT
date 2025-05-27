package com.example.choviet.entity;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "invoice_items")
@Data
public class InvoiceItem {
    @Id
    private String id;
    private Invoice invoice;
    private Product product;
    private int quantity;
    private int unitPrice;
    private int subtotal;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}