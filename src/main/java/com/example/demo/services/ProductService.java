package com.example.demo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import com.example.demo.security.JwtUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

import com.example.demo.models.Product;
import com.example.demo.repositories.ProductRepository;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.dtos.ProductInput;
import com.example.demo.enums.ProductCondition;
import com.example.demo.exceptions.InvalidInputException;
import java.util.Date;
import java.util.List;

@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CategoryService categoryService;
    
    
    @Autowired
    private JwtUtils jwtUtils;
    
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No authentication found");
        }
        return authentication.getName();
    }
    
    public List<Product> getAllProducts(Pageable pageable) {
        try {
            Page<Product> products = productRepository.findByStatusNotIn(List.of("SOLD", "DELETED"), pageable);
            return products.getContent();
        } catch (Exception e) {
            System.err.println("Error in getAllProducts: " + e.getMessage());
            // Trả về danh sách rỗng thay vì ném ngoại lệ để tránh ảnh hưởng đến giao diện người dùng
            return List.of();
        }
    }
    
    public Product getProductById(String id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }
    
    public List<Product> getProductsByCategory(String categoryId, Pageable pageable) {
        return productRepository.findByCategoryId(categoryId, pageable).getContent();
    }
    
    public List<Product> getProductsBySeller(String username, Pageable pageable) {
        return productRepository.findBySellerUsername(username, pageable).getContent();
    }
    
    public List<Product> searchProducts(String keyword, Pageable pageable) {
        return productRepository.searchByTitle(keyword, pageable).getContent();
    }
    
    public Product createProduct(ProductInput input, String username) {
        validateCondition(input.getCondition());
        validateCategoryId(input.getCategoryId());
        
        Product product = new Product();
        product.setTitle(input.getTitle());
        product.setDescription(input.getDescription());
        product.setPrice(input.getPrice());
        product.setCategoryId(input.getCategoryId());
        product.setCondition(input.getCondition());
        product.setImages(input.getImages());
        product.setLocation(input.getLocation());
        product.setNegotiable(input.getNegotiable());
        product.setSellerUsername(username);
        product.setStatus("ACTIVE");
        
        // Make sure we explicitly set the dates
        Date now = new Date();
        product.setCreatedAt(now);
        product.setUpdatedAt(now);
        
        product.setQuantity(input.getQuantity() != null ? input.getQuantity() : 1);
        
        return productRepository.save(product);
    }
    
    public Product updateProduct(String id, ProductInput input, String username) {
        validateCondition(input.getCondition());
        validateCategoryId(input.getCategoryId());
        
        Product product = getProductById(id);
        
        // Check if current user is the seller
        if (!product.getSellerUsername().equals(username)) {
            throw new InvalidInputException("You can only update your own products");
        }
        
        product.setTitle(input.getTitle());
        product.setDescription(input.getDescription());
        product.setPrice(input.getPrice());
        product.setCategoryId(input.getCategoryId());
        product.setCondition(input.getCondition());
        product.setImages(input.getImages());
        product.setLocation(input.getLocation());
        product.setNegotiable(input.getNegotiable());
        
        // Update quantity only if provided in the input
        if (input.getQuantity() != null) {
            product.setQuantity(input.getQuantity());
        }
        
        product.setUpdatedAt(new Date());
        
        return productRepository.save(product);
    }
    
    public Boolean deleteProduct(String id) {
        Product product = getProductById(id);
        
        // Check if current user is the seller
        if (!product.getSellerUsername().equals(getCurrentUsername())) {
            throw new InvalidInputException("You can only delete your own products");
        }
        
        productRepository.delete(product);
        return true;
    }
    
    public Product toggleProductStatus(String id, String status) {
        Product product = getProductById(id);
        product.setStatus(status);
        product.setUpdatedAt(new Date());
        return productRepository.save(product);
    }
    
    private void validateCondition(String condition) {
        try {
            ProductCondition.valueOf(condition);
        } catch (IllegalArgumentException e) {
            throw new InvalidInputException("Invalid product condition");
        }
    }
    
    private void validateCategoryId(String categoryId) {
        if (!categoryService.existsById(categoryId)) {
            throw new InvalidInputException("Invalid category ID. Category does not exist.");
        }
    }
}
