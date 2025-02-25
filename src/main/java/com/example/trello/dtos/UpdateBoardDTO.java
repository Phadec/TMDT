package com.example.trello.dtos;

import lombok.Data;

@Data
public class UpdateBoardDTO {
    private String name;
    private String description;
    private String background;
    private Boolean isPublic;
    private Boolean starred;
}
