package com.example.demo.services;

import com.example.demo.models.CartItem;
import com.example.demo.models.Product;
import com.example.demo.repositories.CartItemRepository;
import com.example.demo.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    
    public List<CartItem> getCartItems(String username) {
        try {
            System.out.println("Fetching cart items for user: " + username);
            List<CartItem> items = cartItemRepository.findByUsername(username);
            System.out.println("Found " + items.size() + " cart items");
            return items;
        } catch (Exception e) {
            System.err.println("Error fetching cart items: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    public long getCartItemCount(String username) {
        try {
            long count = cartItemRepository.countByUsername(username);
            System.out.println("Cart item count for " + username + ": " + count);
            return count;
        } catch (Exception e) {
            System.err.println("Error counting cart items: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @Transactional
    public CartItem addToCart(String username, String productId, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            throw new IllegalArgumentException("Product not found");
        }
        
        Product product = productOpt.get();
        
        // Check if the product is already in the cart
        Optional<CartItem> existingCartItem = cartItemRepository.findByUsernameAndProductId(username, productId);
        
        CartItem cartItem;
        
        if (existingCartItem.isPresent()) {
            // Update quantity if the product is already in the cart
            cartItem = existingCartItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
        } else {
            // Add new cart item if product is not in the cart
            cartItem = new CartItem(username, product, quantity);
            // Make sure to set productId explicitly
            cartItem.setProductId(productId);
        }
        
        try {
            CartItem savedItem = cartItemRepository.save(cartItem);
            System.out.println("Added/updated cart item: " + savedItem.getId() + " for user: " + username);
            return savedItem;
        } catch (Exception e) {
            System.err.println("Error adding to cart: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @Transactional
    public CartItem updateCartItemQuantity(String username, String productId, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        
        Optional<CartItem> cartItemOpt = cartItemRepository.findByUsernameAndProductId(username, productId);
        if (cartItemOpt.isEmpty()) {
            throw new IllegalArgumentException("Cart item not found");
        }
        
        CartItem cartItem = cartItemOpt.get();
        cartItem.setQuantity(quantity);
        return cartItemRepository.save(cartItem);
    }
    
    @Transactional
    public boolean removeFromCart(String username, String productId) {
        Optional<CartItem> cartItemOpt = cartItemRepository.findByUsernameAndProductId(username, productId);
        if (cartItemOpt.isEmpty()) {
            throw new IllegalArgumentException("Cart item not found");
        }
        
        cartItemRepository.deleteByUsernameAndProductId(username, productId);
        return true;
    }
    
    @Transactional
    public boolean clearCart(String username) {
        cartItemRepository.deleteByUsername(username);
        return true;
    }
}