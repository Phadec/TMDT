package com.example.demo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
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
        
        // Ensure quantity is not null and defaults to 1 if not specified
        product.setQuantity(input.getQuantity() != null && input.getQuantity() > 0 ? input.getQuantity() : 1);
        
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
    
    /**
     * Calculate the total number of products sold by a seller
     */
    public int getTotalSoldProductsByUsername(String username) {
        try {
            System.out.println("======= CALCULATING TOTAL SOLD PRODUCTS FOR: " + username + " =======");
            
            // Get ALL products by this seller, not just SOLD status ones
            List<Product> allProducts = productRepository.findBySellerUsername(username);
            System.out.println("Found " + allProducts.size() + " total products for " + username);
            
            int totalSold = 0;
            
            // Sum all soldQuantity values across all products, regardless of status
            for (Product p : allProducts) {
                int soldQty = p.getSoldQuantity() != null ? p.getSoldQuantity() : 0;
                totalSold += soldQty;
                
                // Debug info for each product
                if (soldQty > 0) {
                    System.out.println("Product ID: " + p.getId() + 
                                      ", Title: " + p.getTitle() + 
                                      ", Status: " + p.getStatus() +
                                      ", SoldQuantity: " + soldQty);
                }
            }
            
            System.out.println("Final total sold quantity across ALL products: " + totalSold);
            return totalSold;
            
        } catch (Exception e) {
            System.err.println("Error calculating total sold products: " + e.getMessage());
            e.printStackTrace();
            return 0;
        }
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
