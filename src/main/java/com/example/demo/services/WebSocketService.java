package com.example.demo.services;

import com.example.demo.models.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class WebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    /**
     * Send a message to a specific chat channel
     */
    public void sendMessageToChat(String chatId, Message message) {
        try {
            messagingTemplate.convertAndSend("/topic/chat/" + chatId, message);
            
            // Also broadcast to global messages topic for real-time updates
            messagingTemplate.convertAndSend("/topic/messages", message);
            
            // Send to user-specific queue for each participant 
            if (message.getSenderId() != null) {
                messagingTemplate.convertAndSend("/user/" + message.getSenderId() + "/queue/messages", message);
            }
        } catch (Exception e) {
            System.err.println("Error sending message to chat: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Send a message to a specific chat channel with a unique message ID to prevent duplicates
     * @param chatId the chat channel ID
     * @param message the message object to send
     * @param messageId a unique ID to identify this message for deduplication
     */
    public void sendMessageToChat(String chatId, Message message, String messageId) {
        try {
            // Create headers with the message ID
            Map<String, Object> headers = new HashMap<>();
            headers.put("messageId", messageId);
            
            // Send to the chat-specific topic with headers
            messagingTemplate.convertAndSendToUser(
                chatId, 
                "/topic/chat/" + chatId, 
                message,
                headers
            );
            
            // Also broadcast to global messages topic for real-time updates
            messagingTemplate.convertAndSend(
                "/topic/messages", 
                message,
                headers
            );
            
            // Send to user-specific queue for each participant if sender ID is available
            if (message.getSenderId() != null) {
                messagingTemplate.convertAndSendToUser(
                    message.getSenderId(),
                    "/queue/messages", 
                    message,
                    headers
                );
            }
        } catch (Exception e) {
            System.err.println("Error sending message to chat with ID: " + e.getMessage());
            e.printStackTrace();
            
            // Fallback to the standard method if there's an issue with headers
            sendMessageToChat(chatId, message);
        }
    }

    /**
     * Notify a specific user about a new message
     */
    public void notifyUser(String username, Message message) {
        try {
            messagingTemplate.convertAndSendToUser(
                username, 
                "/queue/messages", 
                message
            );
        } catch (Exception e) {
            System.err.println("Error sending notification to user: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
