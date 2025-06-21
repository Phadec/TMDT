package com.example.choviet.controller.admin;

import com.example.choviet.dto.ApiResponse;
import com.example.choviet.entity.ProductCategory;
import com.example.choviet.service.ProductCategoryService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import static com.example.choviet.config.Code.*;
import static com.example.choviet.config.api.Prefix.*;

@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping(ADMIN + "/categories")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class ProductCategoryAdminController {

    @Autowired
    ProductCategoryService categoryService;

    // Lấy tất cả danh mục
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductCategory>>> getAllCategories() {
        List<ProductCategory> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", categories));
    }

    // Lấy danh mục gốc
    @GetMapping("/parents")
    public ResponseEntity<ApiResponse<List<ProductCategory>>> getParentCategories() {
        List<ProductCategory> categories = categoryService.getParentCategories();
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", categories));
    }

    // Lấy danh mục con theo parentId
    @GetMapping("/children/{parentId}")
    public ResponseEntity<ApiResponse<List<ProductCategory>>> getChildCategories(@PathVariable String parentId) {
        List<ProductCategory> categories = categoryService.getChildCategories(parentId);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", categories));
    }

    // Lấy danh mục theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductCategory>> getCategoryById(@PathVariable String id) {
        Optional<ProductCategory> categoryOpt = categoryService.getCategoryById(id);
        if (categoryOpt.isPresent()) {
            return ResponseEntity.ok(new ApiResponse<>(OK, "success", categoryOpt.get()));
        }
        return ResponseEntity.ok(new ApiResponse<>(NOT_FOUND, "Không tìm thấy danh mục", null));
    }

    // Tạo danh mục mới
    @PostMapping
    public ResponseEntity<ApiResponse<ProductCategory>> createCategory(@RequestBody ProductCategory category) {
        ProductCategory savedCategory = categoryService.createCategory(category);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", savedCategory));
    }

    // Cập nhật danh mục
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductCategory>> updateCategory(@PathVariable String id, @RequestBody ProductCategory category) {
        try {
            ProductCategory updatedCategory = categoryService.updateCategory(id, category);
            return ResponseEntity.ok(new ApiResponse<>(OK, "success", updatedCategory));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(new ApiResponse<>(NOT_FOUND, e.getMessage(), null));
        }
    }

    // Xóa danh mục
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCategory(@PathVariable String id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok(new ApiResponse<>(OK, "success", "Danh mục đã được xóa"));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(new ApiResponse<>(BAD_REQUEST, e.getMessage(), null));
        }
    }

    // Tìm kiếm danh mục theo tên
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProductCategory>>> searchCategories(@RequestParam String keyword) {
        List<ProductCategory> categories = categoryService.searchCategories(keyword);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", categories));
    }

    // Lấy danh mục theo trạng thái
    @GetMapping("/status/{isActive}")
    public ResponseEntity<ApiResponse<List<ProductCategory>>> getCategoriesByStatus(@PathVariable Boolean isActive) {
        List<ProductCategory> categories = categoryService.getCategoriesByStatus(isActive);
        return ResponseEntity.ok(new ApiResponse<>(OK, "success", categories));
    }
}
