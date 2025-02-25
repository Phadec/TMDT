package com.example.trello.dtos;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateListDTO {
    @Size(min = 1, max = 100, message = "List name must be between 1 and 100 characters")
    private String name;
    
    private List<String> cardIds;
    
    @Min(value = 0, message = "Position cannot be negative")
    private Integer position;
    
    private Boolean archived;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
    
    private String color;
    
    private Boolean subscribed;
    
    private List<String> subscribedUsers;
}
