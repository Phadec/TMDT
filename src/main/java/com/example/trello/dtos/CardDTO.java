package com.example.trello.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import java.util.Date;
import java.util.List;
import java.util.ArrayList;
import com.example.trello.models.Priority;
import java.util.Set;
import java.util.HashSet;

@Data
public class CardDTO {
    private String id;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotBlank(message = "List ID is required")
    private String listId;
    
    @Min(value = 0, message = "Position must be greater than or equal to 0")
    private int position;
    
    private Date dueDate;
    private boolean completed;
    private String coverImage;
    private Priority priority;
    private Set<String> assignedMembers = new HashSet<>();
    private List<ChecklistItemDTO> checklistItems = new ArrayList<>();
    private int watcherCount;
    
    @NotBlank(message = "Created by is required")
    private String createdBy = "system"; // Default value
    
    @NotBlank(message = "Last modified by is required")
    private String lastModifiedBy = "system"; // Default value
    
    private Date createdAt;
    private Date updatedAt;
    private List<CommentDTO> comments = new ArrayList<>();
    private List<AttachmentDTO> attachments = new ArrayList<>();
}
