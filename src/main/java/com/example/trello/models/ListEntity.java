package com.example.trello.models;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Document(collection = "lists")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListEntity {
    @Id
    private String id;
    
    private String name;
    
    @Indexed
    private String boardId;
    
    private List<String> cardIds;
    private int position;
    private boolean archived;
    private String description;
    private String color;
    private boolean subscribed;
    private String lastModifiedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime archivedAt;
    private int watcherCount;
    
    @Builder.Default
    private List<String> subscribedUsers = new ArrayList<>();

    // Constructor to ensure subscribedUsers is never null
    public ListEntity(String id, String name, String boardId) {
        this.id = id;
        this.name = name;
        this.boardId = boardId;
        this.subscribedUsers = new ArrayList<>();
        this.cardIds = new ArrayList<>();
    }
}

