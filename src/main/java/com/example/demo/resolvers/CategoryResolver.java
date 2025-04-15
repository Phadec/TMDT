package com.example.demo.resolvers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import com.example.demo.models.Category;
import com.example.demo.services.CategoryService;
import com.example.demo.dtos.CategoryOption;
import com.example.demo.dtos.CategoryProductCount;

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
    
    @QueryMapping
    public List<CategoryProductCount> categoryProductCounts(@Argument(name = "excludeStatuses") List<String> excludeStatuses) {
        return categoryService.getCategoryProductCounts(excludeStatuses);
    }
    
    @SchemaMapping(typeName = "Category", field = "productCount")
    public Integer getProductCount(Category category) {
        return categoryService.getProductCountForCategory(category.getId());
    }
}
