package com.example.choviet.entity;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "invoices")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Invoice {
    @Id
    String id;
    Order order;
    boolean isSeller;
    String invoiceNumber;
    double totalAmount;
    double taxAmount;
    double discountAmount;
    InvoiceStatus status;
    LocalDateTime dueAt;

    public enum InvoiceStatus {
        PENDING, PAID, CANCELED
    }
}

