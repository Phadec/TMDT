package com.example.trello.models;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Date;
import java.util.List;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;

@Document(collection = "cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CardEntity {
    @MongoId
    private String id;  // MongoDB will auto-generate this
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    private String listId;
    
    @Min(value = 0, message = "Position must be greater than or equal to 0")
    private int position;
    
    private Date dueDate;
    private boolean completed;
    private String coverImage;
    private Priority priority;
    private Set<String> assignedMembers = new HashSet<>();
    private List<ChecklistItem> checklistItems = new ArrayList<>();
    private int watcherCount;
    private Set<String> labelColors = new HashSet<>();
    
    @NotBlank(message = "Created by is required")
    private String createdBy;
    
    @NotBlank(message = "Last modified by is required")
    private String lastModifiedBy;
    
    private Date createdAt = new Date();
    private Date updatedAt = new Date();
    private List<Comment> comments = new ArrayList<>();
    private List<Attachment> attachments = new ArrayList<>();

    public List<Comment> getComments() {
        return comments != null ? comments : new ArrayList<>();
    }

    public List<Attachment> getAttachments() {
        return attachments != null ? attachments : new ArrayList<>();
    }
}
