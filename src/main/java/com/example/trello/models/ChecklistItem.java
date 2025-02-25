package com.example.trello.models;

import lombok.Data;

@Data
public class ChecklistItem {
    private String id;
    private String content;
    private boolean completed;
    private int position;
}
