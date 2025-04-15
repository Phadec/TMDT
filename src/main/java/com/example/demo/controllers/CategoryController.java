package com.example.demo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.services.CategoryService;
import com.example.demo.dtos.CategoryProductCount;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;
    
    /**
     * REST endpoint for category product counts as a fallback option
     * This returns a map of category IDs to product counts
     */
    @GetMapping("/product-counts")
    public ResponseEntity<Map<String, Integer>> getCategoryProductCounts() {
        List<CategoryProductCount> counts = categoryService.getCategoryProductCounts();
        Map<String, Integer> countMap = new HashMap<>();
        
        for (CategoryProductCount count : counts) {
            countMap.put(count.getId(), count.getCount());
        }
        
        return ResponseEntity.ok(countMap);
    }
}