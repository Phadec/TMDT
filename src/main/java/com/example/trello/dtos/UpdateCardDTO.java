package com.example.trello.dtos;

import com.example.trello.models.Priority;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
public class UpdateCardDTO {
    private String title;
    private String description;
    private String listId;
    
    @Min(value = 0, message = "Position must be greater than or equal to 0")
    private int position;
    
    private Date dueDate;
    private Boolean completed;
    private String coverImage;
    private Priority priority;
    private Set<String> assignedMembers = new HashSet<>();
    private List<ChecklistItemDTO> checklistItems;
    private Set<String> labelIds = new HashSet<>();
    private String lastModifiedBy;  // Will be set from authenticated user
}
