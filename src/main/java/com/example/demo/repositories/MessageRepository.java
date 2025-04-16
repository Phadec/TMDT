package com.example.demo.repositories;

import com.example.demo.models.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends MongoRepository<Message, String> {
    
    Page<Message> findByChatId(String chatId, Pageable pageable);
    
    @Query("{'chatId': ?0, 'senderId': {$ne: ?1}, 'read': false}")
    List<Message> findUnreadByChatAndReceiver(String chatId, String userId);
    
    // Fix: Use sort parameter with a proper limit
    @Query(value = "{'chatId': ?0}", sort = "{'createdAt': -1}")
    List<Message> findLatestMessagesByChatIdSorted(String chatId, Pageable pageable);
    
    // Add a method to find all messages for a chat, sorted by time
    @Query(value = "{'chatId': ?0}", sort = "{'createdAt': 1}")
    List<Message> findAllByChatIdSorted(String chatId);
    
    // Add a default method to implement the limiting functionality
    default List<Message> findLatestMessagesByChatId(String chatId) {
        try {
            // Use PageRequest to get just the first result, sorted by createdAt in descending order
            return findLatestMessagesByChatIdSorted(chatId, 
                org.springframework.data.domain.PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "createdAt")));
        } catch (Exception e) {
            System.err.println("Error finding latest messages: " + e.getMessage());
            e.printStackTrace();
            return java.util.Collections.emptyList();
        }
    }
    
    // This method is for backward compatibility
    default Optional<Message> findLatestMessageByChatId(String chatId) {
        List<Message> messages = findLatestMessagesByChatId(chatId);
        return messages.isEmpty() ? Optional.empty() : Optional.of(messages.get(0));
    }
    
    // Add method to count unread messages for a user
    @Query(value = "{'senderId': {$ne: ?0}, 'read': false}", count = true)
    long countUnreadMessagesByUser(String userId);
}
