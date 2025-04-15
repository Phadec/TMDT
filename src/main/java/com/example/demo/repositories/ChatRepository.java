package com.example.demo.repositories;

import com.example.demo.models.Chat;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ChatRepository extends MongoRepository<Chat, String> {
    
    @Query("{'participants': {$in: [?0]}}")
    List<Chat> findByParticipant(String userId);
    
    @Query("{'participants': {$all: [?0, ?1]}, 'productId': ?2}")
    Optional<Chat> findByParticipantsAndProduct(String user1Id, String user2Id, String productId);
    
    @Query("{'participants': {$all: [?0, ?1]}, 'productId': null}")
    Optional<Chat> findByParticipantsWithoutProduct(String user1Id, String user2Id);
}
