package com.example.demo.dtos;

import java.util.List;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Min;

@Data
@Getter
@Setter
public class ProductInput {
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @Positive(message = "Price must be positive")
    private double price;
    
    @NotBlank(message = "Category ID is required")
    private String categoryId;
    
    @NotBlank(message = "Condition is required")
    private String condition;
    
    @NotNull(message = "Images are required")
    private List<String> images;
    
    @NotBlank(message = "Location is required")
    private String location;
    
    private Boolean negotiable = false;  // Changed to Boolean and added default value
    
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity = 1;  // Default value of 1
}
