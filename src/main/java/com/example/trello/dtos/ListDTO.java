package com.example.trello.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListDTO {
    private String id;
    private String name;
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
    private List<String> subscribedUsers;
}