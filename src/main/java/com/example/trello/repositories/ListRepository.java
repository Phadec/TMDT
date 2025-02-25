package com.example.trello.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.example.trello.models.ListEntity;
import java.util.List;

@Repository
public interface ListRepository extends MongoRepository<ListEntity, String> {
    List<ListEntity> findByBoardId(String boardId);
    List<ListEntity> findByBoardIdAndArchivedFalse(String boardId);
    List<ListEntity> findByBoardIdAndArchivedTrue(String boardId);
}
