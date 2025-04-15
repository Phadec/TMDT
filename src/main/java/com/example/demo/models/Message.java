package com.example.demo.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "messages")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Message {
    @Id
    private String id;
    private String chatId;
    private String senderId;
    private String content;
    private String imageUrl;
    private MessageType messageType = MessageType.TEXT;
    private boolean read;
    private Date createdAt;
    
    public enum MessageType {
        TEXT,
        IMAGE,
        FILE
    }
}
