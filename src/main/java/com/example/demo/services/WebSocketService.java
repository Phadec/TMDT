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
            // Send to the chat-specific topic
            messagingTemplate.convertAndSend("/topic/chat/" + chatId, message);
            
            // Also broadcast to global messages topic for real-time updates
            messagingTemplate.convertAndSend("/topic/messages", message);
            
            // Debug output for monitoring message routing
            System.out.println("WebSocket: Sent message " + message.getId() + 
                " to chat " + chatId + " and global topic");
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
            messagingTemplate.convertAndSend(
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
            
            // Send to user-specific destinations for each participant
            if (message.getSenderId() != null) {
                messagingTemplate.convertAndSend(
                    "/user/" + message.getSenderId() + "/queue/messages", 
                    message,
                    headers
                );
            }
            
            // Debug output
            System.out.println("WebSocket: Sent message " + message.getId() + 
                " with deduplication ID " + messageId + " to chat " + chatId);
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
            System.out.println("WebSocket: Notified user " + username + " about message " + message.getId());
        } catch (Exception e) {
            System.err.println("Error sending notification to user: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Broadcast a notification that a message has been updated
     * This helps with ensuring all clients have the latest message state
     */
    public void broadcastMessageUpdate(Message message) {
        try {
            messagingTemplate.convertAndSend("/topic/message-updates", message);
            System.out.println("WebSocket: Broadcast message update for " + message.getId());
        } catch (Exception e) {
            System.err.println("Error broadcasting message update: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
