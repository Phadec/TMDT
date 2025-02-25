package com.example.demo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.models.Category;
import com.example.demo.repositories.CategoryRepository;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.dtos.CategoryOption;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    public List<Category> getAllCategories() {
        return categoryRepository.findAll().stream()
            .filter(Category::isActive)
            .toList();
    }
    
    public Category getCategoryById(String id) {
        return categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }
    
    public Category getCategoryBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }
    
    public boolean existsById(String id) {
        return categoryRepository.existsById(id);
    }
    
    public List<CategoryOption> getAvailableCategoryOptions() {
        List<Category> allCategories = categoryRepository.findAll();
        Map<String, String> categoryNames = allCategories.stream()
            .collect(Collectors.toMap(Category::getId, Category::getName));
            
        return allCategories.stream()
            .filter(Category::isActive)
            .map(category -> CategoryOption.builder()
                .id(category.getId())
                .name(category.getName())
                .level(category.getLevel())
                .parentName(category.getParentId() != null ? 
                    categoryNames.get(category.getParentId()) : null)
                .build())
            .collect(Collectors.toList());
    }
}
