package com.example.demo.resolvers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.example.demo.models.Category;
import com.example.demo.services.CategoryService;
import com.example.demo.dtos.CategoryOption;

import java.util.List;

@Controller
public class CategoryResolver {
    
    @Autowired
    private CategoryService categoryService;
    
    @QueryMapping(name = "categories")
    public List<Category> getAvailableCategories() {
        return categoryService.getAllCategories().stream()
            .filter(Category::isActive)
            .toList();
    }
    
    @QueryMapping
    public Category category(@Argument String id) {
        return categoryService.getCategoryById(id);
    }
    
    @QueryMapping
    public Category categoryBySlug(@Argument String slug) {
        return categoryService.getCategoryBySlug(slug);
    }
    
    @QueryMapping
    public List<CategoryOption> availableCategories() {
        return categoryService.getAvailableCategoryOptions();
    }
}
