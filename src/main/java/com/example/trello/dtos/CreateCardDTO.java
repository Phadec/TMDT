package com.example.trello.dtos;

import com.example.trello.models.Priority;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
public class CreateCardDTO {
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotBlank(message = "List ID is required")
    private String listId;
    
    @Min(value = 0, message = "Position must be greater than or equal to 0")
    private int position;
    
    private Date dueDate;
    private String coverImage;
    private Priority priority;
    private Set<String> assignedMembers = new HashSet<>();
    private List<ChecklistItemDTO> checklistItems = new ArrayList<>();
    private Set<String> labelIds = new HashSet<>();
    
    private String createdBy;  // Will be set from authenticated user
}
