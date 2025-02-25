package com.example.trello.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateBoardDTO {
    @NotBlank(message = "Board name is required")
    private String name;
    private String description;
    private String background;
    private Boolean isPublic = false;
}

