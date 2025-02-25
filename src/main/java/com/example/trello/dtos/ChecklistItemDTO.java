package com.example.trello.dtos;

import lombok.Data;

@Data
public class ChecklistItemDTO {
    private String id;
    private String content;
    private boolean completed;
    private int position;
}
