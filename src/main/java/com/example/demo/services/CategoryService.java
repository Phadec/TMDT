package com.example.demo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.models.Category;
import com.example.demo.repositories.CategoryRepository;
import com.example.demo.repositories.ProductRepository;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.dtos.CategoryOption;
import com.example.demo.dtos.CategoryProductCount;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
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
    
    /**
     * Get product counts for all categories (including subcategory products)
     * This method calculates how many products are in each category and its subcategories.
     * 
     * @return List of CategoryProductCount objects containing category ID and count
     */
    public List<CategoryProductCount> getCategoryProductCounts() {
        // Default implementation - no status filtering
        return getCategoryProductCounts(null);
    }
    
    /**
     * Get product counts for all categories, excluding products with specified statuses
     * This method calculates how many products are in each category and its subcategories,
     * while excluding products that have any of the specified statuses.
     * 
     * @param excludeStatuses List of product statuses to exclude (e.g., "SOLD", "DELETED")
     * @return List of CategoryProductCount objects containing category ID and filtered count
     */
    public List<CategoryProductCount> getCategoryProductCounts(List<String> excludeStatuses) {
        List<Category> categories = categoryRepository.findAll();
        Map<String, Integer> countMap = new HashMap<>();
        
        // Build parent-child relationships map for efficiency
        Map<String, List<String>> childrenMap = new HashMap<>();
        for (Category category : categories) {
            String parentId = category.getParentId();
            if (parentId != null && !parentId.isEmpty()) {
                childrenMap.computeIfAbsent(parentId, k -> new ArrayList<>())
                    .add(category.getId());
            }
        }
        
        // Get direct product counts for each category
        for (Category category : categories) {
            int directCount;
            if (excludeStatuses != null && !excludeStatuses.isEmpty()) {
                // Count products excluding specified statuses
                directCount = productRepository.countByCategoryIdAndStatusNotIn(
                    category.getId(), excludeStatuses);
            } else {
                // Count all products
                directCount = productRepository.countByCategoryId(category.getId());
            }
            countMap.put(category.getId(), directCount);
        }
        
        // Add subcategory product counts to parent categories
        for (Category category : categories) {
            if (category.getParentId() == null || category.getParentId().isEmpty()) {
                // This is a root category, calculate total count recursively
                updateTotalCountRecursively(category.getId(), countMap, childrenMap);
            }
        }
        
        // Convert to DTO list
        return countMap.entrySet().stream()
            .map(entry -> CategoryProductCount.builder()
                .id(entry.getKey())
                .count(entry.getValue())
                .build())
            .collect(Collectors.toList());
    }
    
    /**
     * Helper method to recursively calculate total product counts
     * This adds product counts from all subcategories to the parent category
     */
    private int updateTotalCountRecursively(String categoryId, Map<String, Integer> countMap, Map<String, List<String>> childrenMap) {
        int totalCount = countMap.getOrDefault(categoryId, 0);
        
        // Get all children of this category
        List<String> children = childrenMap.getOrDefault(categoryId, new ArrayList<>());
        
        // Recursively add counts from all children
        for (String childId : children) {
            totalCount += updateTotalCountRecursively(childId, countMap, childrenMap);
        }
        
        // Update the count in the map
        countMap.put(categoryId, totalCount);
        return totalCount;
    }
    
    /**
     * Calculate product count for a specific category, including all its subcategories
     * 
     * @param categoryId the ID of the category
     * @return total number of products in the category and all its subcategories
     */
    public int getProductCountForCategory(String categoryId) {
        // Get all categories to build the parent-child relationships
        List<Category> allCategories = categoryRepository.findAll();
        
        // Find all subcategory IDs
        List<String> subcategoryIds = findAllSubcategoryIds(categoryId, allCategories);
        
        // Add the category itself
        subcategoryIds.add(categoryId);
        
        // Count products in all subcategories
        int totalCount = 0;
        for (String id : subcategoryIds) {
            totalCount += productRepository.countByCategoryId(id);
        }
        
        return totalCount;
    }
    
    /**
     * Find all subcategory IDs for a given category
     */
    private List<String> findAllSubcategoryIds(String parentId, List<Category> allCategories) {
        List<String> result = new ArrayList<>();
        
        // Find direct children
        List<Category> children = allCategories.stream()
            .filter(c -> parentId.equals(c.getParentId()))
            .collect(Collectors.toList());
        
        // Add direct children IDs
        for (Category child : children) {
            result.add(child.getId());
            
            // Recursively add grandchildren
            result.addAll(findAllSubcategoryIds(child.getId(), allCategories));
        }
        
        return result;
    }
}
