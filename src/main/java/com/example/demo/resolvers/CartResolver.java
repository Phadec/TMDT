package com.example.demo.resolvers;

import com.example.demo.models.CartItem;
import com.example.demo.services.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class CartResolver {

    @Autowired
    private CartService cartService;

    // Helper method to get current username
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        return null;
    }

    // Query Resolvers
    @QueryMapping
    public List<CartItem> cartItems(@Argument int page, @Argument int size) {
        // Get username from security context directly instead of requiring it as parameter
        String currentUsername = getCurrentUsername();
        if (currentUsername == null) {
            throw new RuntimeException("User must be authenticated to view cart");
        }
        
        return cartService.getCartItems(currentUsername);
    }

    @QueryMapping
    public int cartItemCount() {
        // Get username from security context
        String currentUsername = getCurrentUsername();
        if (currentUsername == null) {
            throw new RuntimeException("User must be authenticated to view cart count");
        }
        
        return (int) cartService.getCartItemCount(currentUsername);
    }

    // Mutation Resolvers
    @MutationMapping
    public CartItem addToCart(@Argument String productId, @Argument int quantity) {
        String username = getCurrentUsername();
        if (username == null) {
            throw new RuntimeException("User must be authenticated to add items to cart");
        }
        
        // Validate input parameters
        if (productId == null || productId.isEmpty()) {
            throw new IllegalArgumentException("Product ID cannot be empty");
        }
        
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        
        System.out.println("Adding to cart - Username: " + username + 
                          ", ProductID: " + productId + 
                          ", Quantity: " + quantity);
        
        return cartService.addToCart(username, productId, quantity);
    }

    @MutationMapping
    public CartItem updateCartItemQuantity(@Argument String productId, @Argument int quantity) {
        String username = getCurrentUsername();
        if (username == null) {
            throw new RuntimeException("User must be authenticated to update cart");
        }
        
        return cartService.updateCartItemQuantity(username, productId, quantity);
    }

    @MutationMapping
    public boolean removeFromCart(@Argument String productId) {
        String username = getCurrentUsername();
        if (username == null) {
            throw new RuntimeException("User must be authenticated to remove items from cart");
        }
        
        return cartService.removeFromCart(username, productId);
    }

    @MutationMapping
    public boolean clearCart() {
        String username = getCurrentUsername();
        if (username == null) {
            throw new RuntimeException("User must be authenticated to clear cart");
        }
        
        return cartService.clearCart(username);
    }
}
