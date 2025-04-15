package com.example.demo.resolvers;

import com.example.demo.models.Chat;
import com.example.demo.models.Message;
import com.example.demo.models.Product;
import com.example.demo.models.User;
import com.example.demo.repositories.ProductRepository;
import com.example.demo.repositories.UserRepository;
import com.example.demo.services.ChatService;
import com.example.demo.services.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.multipart.MultipartFile;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Controller
public class ChatResolver {

    @Autowired
    private ChatService chatService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserService userService;
    
    private SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");

    @QueryMapping
    public List<Chat> userChats() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                System.out.println("User not authenticated in userChats query");
                return new ArrayList<>();
            }
            
            String username = auth.getName();
            System.out.println("Fetching chats for user: " + username);
            
            User user = userService.findByUsername(username);
            System.out.println("Found user with ID: " + user.getId());
            
            List<Chat> chats = chatService.getUserChats(username);
            System.out.println("Found " + chats.size() + " chats for user");
            
            return chats;
        } catch (Exception e) {
            System.err.println("Error in userChats query: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @QueryMapping
    public Chat chat(@Argument String id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            System.out.println("Fetching chat " + id + " for user: " + username);
            return chatService.getChat(id, username);
        } catch (Exception e) {
            System.err.println("Error in chat query: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @QueryMapping
    public List<Message> chatMessages(@Argument String chatId, @Argument int page, @Argument int size) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            System.out.println("Fetching messages for chat " + chatId + ", page " + page + ", size " + size);
            List<Message> messages = chatService.getChatMessages(chatId, username, page, size);
            System.out.println("Found " + messages.size() + " messages");
            return messages;
        } catch (Exception e) {
            System.err.println("Error in chatMessages query: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @QueryMapping
    public Chat chatWithSeller(@Argument String sellerId, @Argument String productId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            return chatService.getChatWithSeller(sellerId, productId, username);
        } catch (Exception e) {
            System.err.println("Error in chatWithSeller query: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @MutationMapping
    public Message sendMessage(
        @Argument String chatId, 
        @Argument String content, 
        @Argument String messageTypeStr,
        @Argument String imageUrl) {
        
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            
            // Xác định đúng loại tin nhắn dựa trên imageUrl
            Message.MessageType messageType = null;
            
            // Nếu có imageUrl, đảm bảo messageType là IMAGE
            if (imageUrl != null && !imageUrl.isEmpty()) {
                messageType = Message.MessageType.IMAGE;
            } else if (messageTypeStr != null) {
                // Nếu không có imageUrl, sử dụng messageType được gửi từ client
                try {
                    messageType = Message.MessageType.valueOf(messageTypeStr);
                } catch (IllegalArgumentException e) {
                    messageType = Message.MessageType.TEXT;
                }
            } else {
                messageType = Message.MessageType.TEXT;
            }
            
            System.out.println("Sending message with type: " + messageType + ", imageUrl: " + imageUrl);
            
            return chatService.sendMessage(chatId, content, imageUrl, messageType, username);
        } catch (Exception e) {
            System.err.println("Error in sendMessage mutation: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @MutationMapping
    public String uploadMessageImage(@Argument("file") MultipartFile file) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            
            return chatService.uploadMessageImage(file, username);
        } catch (Exception e) {
            System.err.println("Error in uploadMessageImage mutation: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @MutationMapping
    public Chat createChat(@Argument String sellerId, @Argument String productId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            return chatService.createChat(sellerId, productId, username);
        } catch (Exception e) {
            System.err.println("Error in createChat mutation: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @MutationMapping
    public Boolean markMessagesAsRead(@Argument String chatId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            return chatService.markMessagesAsRead(chatId, username);
        } catch (Exception e) {
            System.err.println("Error in markMessagesAsRead mutation: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @SchemaMapping(typeName = "Chat", field = "lastMessage")
    public Message getLastMessage(Chat chat) {
        try {
            if (chat == null || chat.getId() == null) {
                System.out.println("Cannot get last message for null chat or chat ID");
                return null;
            }
            
            System.out.println("Getting last message for chat: " + chat.getId());
            Message message = chatService.getLatestMessage(chat.getId());
            
            if (message != null) {
                System.out.println("Found last message: " + message.getId() + 
                    " content: " + message.getContent() + 
                    " type: " + message.getMessageType());
            } else {
                System.out.println("No last message found for chat: " + chat.getId());
            }
            
            return message;
        } catch (Exception e) {
            System.err.println("Error in getLastMessage resolver: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
    
    @SchemaMapping(typeName = "Chat", field = "unreadCount")
    public Integer getUnreadCount(Chat chat) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userService.findByUsername(auth.getName());
            return chatService.getUnreadCount(chat.getId(), currentUser.getId());
        } catch (Exception e) {
            System.err.println("Error in getUnreadCount resolver: " + e.getMessage());
            e.printStackTrace();
            return 0;
        }
    }
    
    @SchemaMapping(typeName = "Chat", field = "product")
    public Product getProduct(Chat chat) {
        try {
            if (chat.getProductId() == null) {
                return null;
            }
            return productRepository.findById(chat.getProductId()).orElse(null);
        } catch (Exception e) {
            System.err.println("Error in getProduct resolver: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
    
    @SchemaMapping(typeName = "Chat", field = "participants")
    public List<User> getParticipants(Chat chat) {
        try {
            List<User> users = new ArrayList<>();
            if (chat.getParticipants() != null) {
                for (String userId : chat.getParticipants()) {
                    userRepository.findById(userId).ifPresent(users::add);
                }
            }
            return users;
        } catch (Exception e) {
            System.err.println("Error in getParticipants resolver: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    @SchemaMapping(typeName = "Message", field = "sender")
    public User getSender(Message message) {
        try {
            Optional<User> user = userRepository.findById(message.getSenderId());
            return user.orElse(null);
        } catch (Exception e) {
            System.err.println("Error in getSender resolver: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
    
    @SchemaMapping(typeName = "Message", field = "createdAt")
    public String getMessageCreatedAt(Message message) {
        try {
            return dateFormat.format(message.getCreatedAt());
        } catch (Exception e) {
            System.err.println("Error in getMessageCreatedAt resolver: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
    
    @SchemaMapping(typeName = "Chat", field = "createdAt")
    public String getChatCreatedAt(Chat chat) {
        try {
            return dateFormat.format(chat.getCreatedAt());
        } catch (Exception e) {
            System.err.println("Error in getChatCreatedAt resolver: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
    
    @SchemaMapping(typeName = "Chat", field = "updatedAt")
    public String getChatUpdatedAt(Chat chat) {
        try {
            return chat.getUpdatedAt() != null ? dateFormat.format(chat.getUpdatedAt()) : null;
        } catch (Exception e) {
            System.err.println("Error in getChatUpdatedAt resolver: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}
