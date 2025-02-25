package com.example.trello.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.trello.models.Board;
import java.util.List;

public interface BoardRepository extends MongoRepository<Board, String> {
    List<Board> findByOwner(String owner);
    List<Board> findByMembersContaining(String userId);
}
