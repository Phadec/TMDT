package com.example.trello.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Data
@Document(collection = "boards")
public class Board {
    @Id
    private String id;
    private String name;
    private String description;
    private String owner;
    private List<String> members = new ArrayList<>();
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    private String background;
    private boolean isPublic = false;
    private boolean starred = false;
    private List<Label> labels = new ArrayList<>();

    @Data
    public static class Label {
        private String id;
        private String name;
        private String color;
    }

    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }
}
