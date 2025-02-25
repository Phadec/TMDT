package com.example.trello.dtos;

import lombok.Data;
import java.util.Date;

@Data
public class CommentDTO {
    private String content;
    private String username;
    private Date createdAt;
}