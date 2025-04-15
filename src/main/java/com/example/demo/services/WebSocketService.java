package com.example.demo.services;

import com.example.demo.models.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendMessageToChat(String chatId, Message message) {
        try {
            // Send to chat-specific topic
            messagingTemplate.convertAndSend("/topic/chat/" + chatId, message);
            
            // Also send to global messages topic for last message updates
            messagingTemplate.convertAndSend("/topic/messages", message);
            
            System.out.println("Message sent to WebSocket topics for chat " + chatId);
        } catch (Exception e) {
            System.err.println("Error sending message via WebSocket: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
