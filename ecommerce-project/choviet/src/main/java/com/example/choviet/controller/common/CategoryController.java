package com.example.choviet.controller.common;
import static com.example.choviet.config.api.Prefix.*;
import static com.example.choviet.config.api.suffix.Category.*;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.choviet.dto.ApiResponse;
import com.example.choviet.service.CategoryService;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping(COMMON + CATEGORY)
public class CategoryController {
    @Autowired
    CategoryService categoryService;

    @PostMapping(GET_ALL)
    public ResponseEntity<ApiResponse<List<String>>> getAll() {
        List<String> categories = categoryService.getAllCategories();
        ApiResponse<List<String>> response = new ApiResponse<>(200, "Success", categories);
        return ResponseEntity.ok(response);
    }
    
}
