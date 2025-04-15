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
    public List<CartItem> cartItems(@Argument String username, @Argument int page, @Argument int size) {
        // Security check to ensure users can only access their own cart
        String currentUsername = getCurrentUsername();
        if (currentUsername == null || !currentUsername.equals(username)) {
            throw new RuntimeException("You can only access your own cart");
        }
        
        return cartService.getCartItems(username);
    }

    @QueryMapping
    public int cartItemCount(@Argument String username) {
        // Security check to ensure users can only access their own cart
        String currentUsername = getCurrentUsername();
        if (currentUsername == null || !currentUsername.equals(username)) {
            throw new RuntimeException("You can only access your own cart");
        }
        
        return (int) cartService.getCartItemCount(username);
    }

    // Mutation Resolvers
    @MutationMapping
    public CartItem addToCart(@Argument String productId, @Argument int quantity) {
        String username = getCurrentUsername();
        if (username == null) {
            throw new RuntimeException("User must be authenticated to add items to cart");
        }
        
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
