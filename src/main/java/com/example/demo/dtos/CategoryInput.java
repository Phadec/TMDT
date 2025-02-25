package com.example.demo.dtos;

import lombok.Data;

@Data
public class CategoryInput {
    private String name;
    private String slug;
    private String description;
    private String parentId;
    private String image;
    private int level;
    private Boolean isActive;
}
