package com.example.trello.repositories;

import com.example.trello.models.CardEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardRepository extends MongoRepository<CardEntity, String> {
    List<CardEntity> findByListIdOrderByPositionAsc(String listId);
    
    @Query(value = "{ 'listId': ?0 }", fields = "{ 'position': 1 }")
    List<CardEntity> findAllPositionsByListId(String listId);
    
    List<CardEntity> findByListIdAndPositionBetween(String listId, int minPosition, int maxPosition);

    @Aggregation(pipeline = {
        "{ $match: { 'listId': ?0 } }",
        "{ $group: { '_id': null, 'maxPosition': { $max: '$position' } } }"
    })
    Integer findMaxPosition(String listId);
}
