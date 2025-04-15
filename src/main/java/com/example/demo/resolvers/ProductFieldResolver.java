package com.example.demo.resolvers;

import com.example.demo.models.FavoriteProduct;
import com.example.demo.models.Product;
import com.example.demo.repositories.ProductRepository;
import com.example.demo.services.ProductInteractionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

import java.util.Optional;

@Controller
public class ProductFieldResolver {

    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private ProductInteractionService productInteractionService;

    @SchemaMapping(typeName = "FavoriteProduct", field = "product")
    public Product getProduct(FavoriteProduct favoriteProduct) {
        // Get the product by ID
        Optional<Product> productOpt = productRepository.findById(favoriteProduct.getProductId());
        
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            
            // Set isFavorited to true since this is coming from favorites
            product.setIsFavorited(true);
            
            return product;
        }
        
        return null;
    }
    
    @SchemaMapping(typeName = "Product", field = "isFavorited")
    public Boolean isFavorited(Product product) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }
        
        String username = auth.getName();
        return productInteractionService.isProductFavorited(product.getId(), username);
    }
}
