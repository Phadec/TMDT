package com.example.choviet.entity;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "invoices")
public class Invoice {
    @Id
    private String id;
    private Order order;
    private boolean isSeller;
    private String invoiceNumber;
    private double totalAmount;
    private double taxAmount;
    private double discountAmount;
    private InvoiceStatus status;
    private LocalDateTime dueAt;

    public enum InvoiceStatus {
        PENDING, PAID, CANCELED
    }
}

