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
    
    // Fix: Use sort parameter and a method-level implementation to limit results
    @Query(value = "{'chatId': ?0}", sort = "{'createdAt': -1}")
    List<Message> findLatestMessagesByChatIdSorted(String chatId, Pageable pageable);
    
    // Add a default method to implement the limiting functionality
    default List<Message> findLatestMessagesByChatId(String chatId) {
        // Use PageRequest to get just the first result, sorted by createdAt in descending order
        return findLatestMessagesByChatIdSorted(chatId, 
            org.springframework.data.domain.PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "createdAt")));
    }
    
    // This method is for backward compatibility
    default Optional<Message> findLatestMessageByChatId(String chatId) {
        List<Message> messages = findLatestMessagesByChatId(chatId);
        return messages.isEmpty() ? Optional.empty() : Optional.of(messages.get(0));
    }
}
