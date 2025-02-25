package com.example.trello.models;

import java.util.Date;
import lombok.Data;

@Data
public class Comment {
    private String id;
    private String content;
    private String username;
    private Date createdAt = new Date();
}
