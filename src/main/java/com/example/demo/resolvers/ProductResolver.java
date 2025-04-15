package com.example.demo.resolvers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.domain.Page;

import com.example.demo.models.Product;
import com.example.demo.models.Category;
import com.example.demo.models.User;
import com.example.demo.services.ProductService;
import com.example.demo.services.CategoryService;
import com.example.demo.services.UserService;
import com.example.demo.config.SecurityUtils;
import com.example.demo.dtos.ProductInput;
import com.example.demo.repositories.ProductRepository;

import java.util.List;

@Controller
public class ProductResolver {
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private CategoryService categoryService;
    
    @Autowired
    private UserService userService;

    @Autowired
    private ProductRepository productRepository;
    
    // Queries
    @QueryMapping
    public List<Product> products(@Argument int page, @Argument int size) {
        return productService.getAllProducts(PageRequest.of(page, size));
    }
    
    @QueryMapping
    public Product product(@Argument String id) {
        Product product = productService.getProductById(id);
        
        // Debug log for product dates
        System.out.println("Product " + id + " creation date: " + product.getCreatedAt());
        
        return product;
    }
    
    @QueryMapping
    public List<Product> productsByCategory(@Argument String categoryId, @Argument int page, @Argument int size) {
        return productService.getProductsByCategory(categoryId, PageRequest.of(page, size));
    }
    
    @QueryMapping
    public Page<Product> productsBySeller(@Argument String username, @Argument Integer page, @Argument Integer size) {
        return productRepository.findBySellerUsername(username, PageRequest.of(page != null ? page : 0, size != null ? size : 10));
    }

    @QueryMapping
    public List<Product> sellerProducts(@Argument String username, @Argument String status) {
        return productRepository.findByStatusAndSellerUsernameOrderByCreatedAtDesc(status, username);
    }
    
    @QueryMapping
    public List<Product> searchProducts(@Argument String keyword, @Argument int page, @Argument int size) {
        return productService.searchProducts(keyword, PageRequest.of(page, size));
    }
    
    // Mutations
    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Product createProduct(@Argument ProductInput input) {
        String username = SecurityUtils.getCurrentUsername();
        if (username == null) {
            throw new RuntimeException("User must be authenticated to create a product");
        }
        
        // Log the input for debugging
        System.out.println("Creating product with input: " + input);
        System.out.println("Quantity received: " + input.getQuantity());
        
        return productService.createProduct(input, username);
    }
    
    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Product updateProduct(@Argument String id, @Argument ProductInput input) {
        String username = SecurityUtils.getCurrentUsername();
        if (username == null) {
            throw new RuntimeException("User must be authenticated to update a product");
        }
        
        // Log the input for debugging
        System.out.println("Updating product with id: " + id);
        System.out.println("Quantity received: " + input.getQuantity());
        
        return productService.updateProduct(id, input, username);
    }
    
    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Boolean deleteProduct(@Argument String id) {
        return productService.deleteProduct(id);
    }
    
    @MutationMapping
    public Product toggleProductStatus(@Argument String id, @Argument String status) {
        return productService.toggleProductStatus(id, status);
    }
    
    // Field Resolvers
    @SchemaMapping
    public Category category(Product product) {
        try {
            return categoryService.getCategoryById(product.getCategoryId());
        } catch (Exception e) {
            // Trả về danh mục mặc định khi không tìm thấy danh mục thực
            Category defaultCategory = new Category();
            defaultCategory.setId(product.getCategoryId());
            defaultCategory.setName("Unknown Category");
            defaultCategory.setSlug("unknown-category");
            defaultCategory.setLevel(0);
            defaultCategory.setActive(true);
            return defaultCategory;
        }
    }
    
    @SchemaMapping
    public User seller(Product product) {
        return userService.findByUsername(product.getSellerUsername());
    }
}
