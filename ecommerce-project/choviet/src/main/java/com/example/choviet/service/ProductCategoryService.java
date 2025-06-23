package com.example.choviet.service;

import com.example.choviet.entity.ProductCategory;
import com.example.choviet.repository.ProductCategoryRepository;
import com.example.choviet.repository.ProductRepository;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Service
public class ProductCategoryService {
    
    @Autowired
    ProductCategoryRepository categoryRepository;
    
    @Autowired
    ProductRepository productRepository;

    /**
     * Lấy tất cả danh mục
     */
    public List<ProductCategory> getAllCategories() {
        List<ProductCategory> categories = categoryRepository.findAll();
        
        // Cập nhật số lượng bài đăng cho mỗi danh mục
        for (ProductCategory category : categories) {
            updatePostCount(category);
        }
        
        return categories;
    }

    /**
     * Lấy danh mục gốc (không có parent)
     */
    public List<ProductCategory> getParentCategories() {
        List<ProductCategory> categories = categoryRepository.findByParentIdIsNull();
        
        // Cập nhật số lượng bài đăng cho mỗi danh mục
        for (ProductCategory category : categories) {
            updatePostCount(category);
        }
        
        return categories;
    }

    /**
     * Lấy danh mục con theo parentId
     */
    public List<ProductCategory> getChildCategories(String parentId) {
        List<ProductCategory> categories = categoryRepository.findByParentId(parentId);
        
        // Cập nhật số lượng bài đăng cho mỗi danh mục
        for (ProductCategory category : categories) {
            updatePostCount(category);
        }
        
        return categories;
    }

    /**
     * Lấy danh mục theo ID
     */
    public Optional<ProductCategory> getCategoryById(String id) {
        Optional<ProductCategory> categoryOpt = categoryRepository.findById(id);
        
        if (categoryOpt.isPresent()) {
            ProductCategory category = categoryOpt.get();
            updatePostCount(category);
        }
        
        return categoryOpt;
    }

    /**
     * Tạo danh mục mới
     */
    public ProductCategory createCategory(ProductCategory category) {
        // Validate parent category exists if parentId is provided
        if (category.getParentId() != null && !category.getParentId().isEmpty()) {
            Optional<ProductCategory> parentCategory = categoryRepository.findById(category.getParentId());
            if (parentCategory.isEmpty()) {
                throw new RuntimeException("Danh mục cha không tồn tại với ID: " + category.getParentId());
            }
        }
        
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());
        
        if (!category.isActive()) {
            category.setActive(true);
        }
        
        if (category.getPostCount() == null) {
            category.setPostCount(0L);
        }
        
        return categoryRepository.save(category);
    }

    /**
     * Cập nhật danh mục
     */
    public ProductCategory updateCategory(String id, ProductCategory updatedCategory) {
        Optional<ProductCategory> existingCategoryOpt = categoryRepository.findById(id);
        
        if (existingCategoryOpt.isPresent()) {
            ProductCategory existingCategory = existingCategoryOpt.get();
            
            // Validate parent category exists if parentId is provided
            if (updatedCategory.getParentId() != null && !updatedCategory.getParentId().isEmpty()) {
                // Don't allow setting itself as parent
                if (updatedCategory.getParentId().equals(id)) {
                    throw new RuntimeException("Danh mục không thể là danh mục cha của chính nó");
                }
                
                Optional<ProductCategory> parentCategory = categoryRepository.findById(updatedCategory.getParentId());
                if (parentCategory.isEmpty()) {
                    throw new RuntimeException("Danh mục cha không tồn tại với ID: " + updatedCategory.getParentId());
                }
            }
            
            if (updatedCategory.getName() != null && !updatedCategory.getName().trim().isEmpty()) {
                existingCategory.setName(updatedCategory.getName().trim());
            }
            
            if (updatedCategory.getDescription() != null) {
                existingCategory.setDescription(updatedCategory.getDescription().trim());
            }
            
            // Handle parentId update (can be set to null)
            existingCategory.setParentId(updatedCategory.getParentId());
            
            if (updatedCategory.getIcon() != null) {
                existingCategory.setIcon(updatedCategory.getIcon().trim());
            }
            
            if (!updatedCategory.isActive()) {
                existingCategory.setActive(false);
            }
            
            existingCategory.setUpdatedAt(LocalDateTime.now());
            
            return categoryRepository.save(existingCategory);
        }
        
        throw new RuntimeException("Không tìm thấy danh mục với ID: " + id);
    }

    /**
     * Xóa danh mục
     */
    public void deleteCategory(String id) {
        // Kiểm tra xem danh mục có tồn tại không
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy danh mục với ID: " + id);
        }
        
        // Kiểm tra xem danh mục có danh mục con không
        List<ProductCategory> childCategories = categoryRepository.findByParentId(id);
        if (!childCategories.isEmpty()) {
            throw new RuntimeException("Không thể xóa danh mục này vì có " + childCategories.size() + " danh mục con. Vui lòng xóa danh mục con trước.");
        }
        
        // Kiểm tra xem danh mục có sản phẩm không
        long productCount = productRepository.countByProductCategoryId(id);
        if (productCount > 0) {
            throw new RuntimeException("Không thể xóa danh mục này vì có " + productCount + " sản phẩm. Vui lòng di chuyển sản phẩm sang danh mục khác trước.");
        }
        
        categoryRepository.deleteById(id);
    }

    /**
     * Tìm kiếm danh mục theo tên
     */
    public List<ProductCategory> searchCategories(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllCategories();
        }
        
        List<ProductCategory> categories = categoryRepository.findByNameContainingIgnoreCase(keyword.trim());
        
        // Cập nhật số lượng bài đăng cho mỗi danh mục
        for (ProductCategory category : categories) {
            updatePostCount(category);
        }
        
        return categories;
    }

    /**
     * Lấy danh mục theo trạng thái
     */
    public List<ProductCategory> getCategoriesByStatus(Boolean isActive) {
        List<ProductCategory> categories = categoryRepository.findByIsActive(isActive);
        
        // Cập nhật số lượng bài đăng cho mỗi danh mục
        for (ProductCategory category : categories) {
            updatePostCount(category);
        }
        
        return categories;
    }
    
    /**
     * Helper method to update post count for a category
     */
    private void updatePostCount(ProductCategory category) {
        try {
            long postCount = productRepository.countByProductCategoryId(category.getId());
            category.setPostCount(postCount);
        } catch (Exception e) {
            // Log error but don't fail the entire operation
            System.err.println("Error updating post count for category " + category.getId() + ": " + e.getMessage());
            category.setPostCount(0L);
        }
    }
}
