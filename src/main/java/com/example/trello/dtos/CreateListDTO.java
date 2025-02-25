package com.example.trello.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateListDTO {
    @NotBlank(message = "List name is required")
    @Size(min = 1, max = 100, message = "List name must be between 1 and 100 characters")
    private String name;

    @NotBlank(message = "Board ID is required")
    private String boardId;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
    
    private String color;
    
    @Min(value = 0, message = "Position cannot be negative")
    private Integer position;
    
    private Boolean subscribed;
}
