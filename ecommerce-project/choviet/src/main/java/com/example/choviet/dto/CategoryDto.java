package com.example.choviet.dto;

import com.example.choviet.entity.ProductCategory;
import lombok.Data;

@Data
public class CategoryDto {
    private String id;
    private String name;

    public static CategoryDto fromEntity(ProductCategory category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        return dto;
    }
}
