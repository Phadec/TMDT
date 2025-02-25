package com.example.demo.dtos;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class CategoryOption {
    private String id;
    private String name;
    private int level;
    private String parentName;
}
