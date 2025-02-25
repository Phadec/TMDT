package com.example.trello.dtos;

import lombok.Data;
import java.util.Date;

@Data
public class AttachmentDTO {
    private String fileName;
    private String fileUrl;
    private String username;
    private Date createdAt;
}
