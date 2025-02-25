package com.example.trello.models;

import java.util.Date;
import lombok.Data;

@Data
public class Attachment {
    private String id;
    private String fileName;
    private String fileUrl;
    private String username;
    private Date createdAt = new Date();
}
