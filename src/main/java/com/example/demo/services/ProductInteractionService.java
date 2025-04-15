package com.example.demo.services;

import com.example.demo.models.Product;
import com.example.demo.models.FavoriteProduct;
import com.example.demo.repositories.ProductRepository;
import com.example.demo.repositories.FavoriteProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ProductInteractionService {

    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private FavoriteProductRepository favoriteProductRepository;
    
    @Transactional
    public Product incrementProductViews(String productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
            
        // Increment views
        Integer views = product.getViews();
        product.setViews(views + 1);
        
        return productRepository.save(product);
    }
    
    @Transactional
    public Product toggleProductFavorite(String productId, String username) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        
        // Check if already favorited
        Optional<FavoriteProduct> favOpt = favoriteProductRepository
            .findByProductIdAndUsername(productId, username);
        
        boolean isFavorited = favOpt.isPresent();
        
        if (isFavorited) {
            // Remove from favorites
            favoriteProductRepository.delete(favOpt.get());
            
            // Decrement favorites count - Fix null comparison
            Integer favorites = product.getFavorites();
            if (favorites != null && favorites > 0) {
                product.setFavorites(favorites - 1);
            }
        } else {
            // Add to favorites
            FavoriteProduct favoriteProduct = new FavoriteProduct();
            favoriteProduct.setProductId(productId);
            favoriteProduct.setUsername(username);
            favoriteProduct.setDateAdded(java.time.LocalDateTime.now());
            favoriteProductRepository.save(favoriteProduct);
            
            // Increment favorites count - Fix null comparison
            Integer favorites = product.getFavorites();
            if (favorites == null) {
                favorites = 0;
            }
            product.setFavorites(favorites + 1);
        }
        
        // Update the product
        return productRepository.save(product);
    }
    
    public boolean isProductFavorited(String productId, String username) {
        if (username == null) {
            return false;
        }
        return favoriteProductRepository.findByProductIdAndUsername(productId, username).isPresent();
    }
}
