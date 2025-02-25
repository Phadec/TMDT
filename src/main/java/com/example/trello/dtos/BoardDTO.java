package com.example.trello.dtos;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class BoardDTO {
    private String id;
    private String name;
    private String description;
    private String owner;
    private List<String> members;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String background;
    private boolean isPublic;
    private boolean starred;
    private List<LabelDTO> labels;

    @Data
    public static class LabelDTO {
        private String id;
        private String name;
        private String color;
    }
}
