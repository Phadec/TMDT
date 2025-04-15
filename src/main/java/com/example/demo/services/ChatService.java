package com.example.demo.services;

import com.example.demo.models.Chat;
import com.example.demo.models.Message;
import com.example.demo.models.User;
import com.example.demo.repositories.ChatRepository;
import com.example.demo.repositories.MessageRepository;
import com.example.demo.repositories.UserRepository;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.exceptions.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ChatService {

    @Autowired
    private ChatRepository chatRepository;
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private WebSocketService webSocketService;

    public List<Chat> getUserChats(String username) {
        User user = userService.findByUsername(username);
        return chatRepository.findByParticipant(user.getId());
    }
    
    public Chat getChat(String chatId, String username) {
        User user = userService.findByUsername(username);
        Chat chat = chatRepository.findById(chatId)
            .orElseThrow(() -> new ResourceNotFoundException("Chat not found"));
            
        if (!chat.getParticipants().contains(user.getId())) {
            throw new UnauthorizedException("You don't have access to this chat");
        }
        
        return chat;
    }
    
    public List<Message> getChatMessages(String chatId, String username, int page, int size) {
        
        // Make sure we get the messages in the right order
        Page<Message> messages = messageRepository.findByChatId(
            chatId, 
            PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        
        // Debug information
        System.out.println("Found " + messages.getTotalElements() + " total messages for chat " + chatId);
        System.out.println("Returning " + messages.getContent().size() + " messages for page " + page);
        
        return messages.getContent();
    }
    
    public Message sendMessage(String chatId, String content, String imageUrl, Message.MessageType messageType, String username) {
        User sender = userService.findByUsername(username);
        Chat chat = getChat(chatId, username);
        
        // Đảm bảo messageType là IMAGE nếu có imageUrl
        if (imageUrl != null && !imageUrl.isEmpty()) {
            messageType = Message.MessageType.IMAGE;
            System.out.println("Setting message type to IMAGE for message with imageUrl: " + imageUrl);
        }
        
        Message message = new Message();
        message.setChatId(chatId);
        message.setSenderId(sender.getId());
        message.setContent(content);
        message.setImageUrl(imageUrl);
        message.setMessageType(messageType != null ? messageType : Message.MessageType.TEXT);
        message.setRead(false);
        message.setCreatedAt(new Date());
        
        System.out.println("Creating message: " + message.getId() + 
                         ", type=" + message.getMessageType() + 
                         ", imageUrl=" + message.getImageUrl() +
                         ", content=" + message.getContent());
        
        chat.setUpdatedAt(new Date());
        chatRepository.save(chat);
        
        Message savedMessage = messageRepository.save(message);
        
        // Make sure to update the chat's lastMessage and send via WebSocket
        chat.setUpdatedAt(new Date());
        chatRepository.save(chat);
        
        // Generate a unique message ID for the WebSocket message to prevent duplicates
        String messageId = UUID.randomUUID().toString();
        
        // Broadcast the message through WebSocket with the unique message ID
        webSocketService.sendMessageToChat(chatId, savedMessage, messageId);
        
        return savedMessage;
    }

    // Giữ lại phương thức cũ để tương thích ngược
    public Message sendMessage(String chatId, String content, String username) {
        return sendMessage(chatId, content, null, Message.MessageType.TEXT, username);
    }

    public String uploadMessageImage(MultipartFile file, String username) {
        if (file.isEmpty()) {
            throw new RuntimeException("File cannot be empty");
        }
        
        try {
            String uploadDir = "uploads";
            Path directory = Paths.get(uploadDir);
            if (!Files.exists(directory)) {
                Files.createDirectories(directory);
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + fileExtension;
            
            // Save the file
            Path filePath = directory.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            System.out.println("Saved chat image to: " + filePath.toAbsolutePath());
            
            // Return the API path to the file
            return "/api/files/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        }
    }
    
    public Chat createChat(String sellerId, String productId, String username) {
        User currentUser = userService.findByUsername(username);
        User seller = userRepository.findById(sellerId)
            .orElseThrow(() -> new ResourceNotFoundException("Seller not found"));
        
        Optional<Chat> existingChat;
        
        if (productId != null && !productId.isEmpty()) {
                
            existingChat = chatRepository.findByParticipantsAndProduct(
                currentUser.getId(), seller.getId(), productId);
        } else {
            existingChat = chatRepository.findByParticipantsWithoutProduct(
                currentUser.getId(), seller.getId());
        }
        
        if (existingChat.isPresent()) {
            return existingChat.get();
        }
        
        Chat newChat = new Chat();
        List<String> participants = new ArrayList<>();
        participants.add(currentUser.getId());
        participants.add(seller.getId());
        newChat.setParticipants(participants);
        newChat.setProductId(productId);
        newChat.setCreatedAt(new Date());
        newChat.setUpdatedAt(new Date());
        
        return chatRepository.save(newChat);
    }
    
    public boolean markMessagesAsRead(String chatId, String username) {
        User currentUser = userService.findByUsername(username);
        
        List<Message> unreadMessages = messageRepository.findUnreadByChatAndReceiver(
            chatId, currentUser.getId());
            
        unreadMessages.forEach(message -> {
            message.setRead(true);
            messageRepository.save(message);
        });
        
        return true;
    }
    
    public Message getLatestMessage(String chatId) {
        try {
            List<Message> messages = messageRepository.findLatestMessagesByChatId(chatId);
            return messages.isEmpty() ? null : messages.get(0);
        } catch (Exception e) {
            System.err.println("Error getting latest message for chat " + chatId + ": " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
    
    public int getUnreadCount(String chatId, String userId) {
        return messageRepository.findUnreadByChatAndReceiver(chatId, userId).size();
    }
    
    public Chat getChatWithSeller(String sellerId, String productId, String username) {
        User currentUser = userService.findByUsername(username);
        User seller = userRepository.findById(sellerId)
            .orElseThrow(() -> new ResourceNotFoundException("Seller not found"));
            
        if (productId != null && !productId.isEmpty()) {
            Optional<Chat> existingChat = chatRepository.findByParticipantsAndProduct(
                currentUser.getId(), seller.getId(), productId);
                
            if (existingChat.isPresent()) {
                return existingChat.get();
            }
        } else {
            Optional<Chat> existingChat = chatRepository.findByParticipantsWithoutProduct(
                currentUser.getId(), seller.getId());
                
            if (existingChat.isPresent()) {
                return existingChat.get();
            }
        }
        
        return null;
    }
}
