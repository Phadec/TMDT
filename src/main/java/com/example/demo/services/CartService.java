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
            
            // Ensure all cart items have their products loaded
            items.forEach(item -> {
                if (item.getProduct() == null && item.getProductId() != null) {
                    Optional<Product> productOpt = productRepository.findById(item.getProductId());
                    productOpt.ifPresent(item::setProduct);
                }
            });
            
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
        
        // Get existing cart item if any
        Optional<CartItem> existingCartItem = cartItemRepository.findByUsernameAndProductId(username, productId);
        int currentQuantityInCart = existingCartItem.map(CartItem::getQuantity).orElse(0);
        
        System.out.println("Adding product to cart - ID: " + productId + 
                           ", Title: " + product.getTitle() + 
                           ", Available in DB: " + product.getQuantity() + 
                           ", Current in cart: " + currentQuantityInCart +
                           ", New request: " + quantity +
                           ", Total requested: " + (currentQuantityInCart + quantity));
        
        // Initialize quantity if it's null to avoid NPE
        if (product.getQuantity() == null) {
            System.out.println("Warning: Product " + productId + " has null quantity, initializing to default value (10)");
            product.setQuantity(10);
            productRepository.save(product); // Save the updated product
        }
        
        // Verify product is in stock and has enough quantity
        if (product.getQuantity() <= 0) {
            throw new IllegalArgumentException("This product is out of stock");
        }
        
        // Calculate total requested quantity (what's already in cart + new request)
        int totalRequestedQuantity = currentQuantityInCart + quantity;
        
        // Verify total doesn't exceed available stock
        if (totalRequestedQuantity > product.getQuantity()) {
            if (currentQuantityInCart > 0) {
                throw new IllegalArgumentException("Cannot add more items. You already have " + 
                    currentQuantityInCart + " in your cart and only " + product.getQuantity() + 
                    " items are available in stock.");
            } else {
                throw new IllegalArgumentException("Cannot add " + quantity + " items. Only " + 
                    product.getQuantity() + " items are available in stock.");
            }
        }
        
        CartItem cartItem;
        
        if (existingCartItem.isPresent()) {
            // Update quantity if the product is already in the cart
            cartItem = existingCartItem.get();
            cartItem.setQuantity(totalRequestedQuantity);
            // Make sure product is set
            cartItem.setProduct(product);
        } else {
            // Add new cart item if product is not in the cart
            cartItem = new CartItem(username, product, quantity);
            // Make sure productId is set explicitly
            cartItem.setProductId(productId);
        }
        
        try {
            CartItem savedItem = cartItemRepository.save(cartItem);
            System.out.println("Added/updated cart item: " + savedItem.getId() + 
                               " for user: " + username + 
                               ", quantity: " + savedItem.getQuantity());
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
        
        System.out.println("Updating cart quantity for user " + username + 
                           ", product " + productId + " to quantity " + quantity);
        
        Optional<CartItem> cartItemOpt = cartItemRepository.findByUsernameAndProductId(username, productId);
        if (cartItemOpt.isEmpty()) {
            throw new IllegalArgumentException("Cart item not found");
        }
        
        // Verify product exists and has enough quantity
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            throw new IllegalArgumentException("Product not found");
        }
        
        Product product = productOpt.get();
        
        // If product quantity is null, initialize it to avoid NPE
        if (product.getQuantity() == null) {
            product.setQuantity(999); // Set a large default quantity
        }
        
        // Verify product is in stock
        if (product.getQuantity() <= 0) {
            throw new IllegalArgumentException("This product is out of stock");
        }
        
        // Verify requested quantity doesn't exceed available stock
        if (quantity > product.getQuantity()) {
            throw new IllegalArgumentException("Cannot update to " + quantity + " items. Only " + 
                product.getQuantity() + " items are available in stock.");
        }
        
        CartItem cartItem = cartItemOpt.get();
        cartItem.setQuantity(quantity);
        CartItem savedItem = cartItemRepository.save(cartItem);
        
        System.out.println("Successfully updated cart item: " + savedItem.getId() + 
                           " to quantity: " + savedItem.getQuantity());
        
        return savedItem;
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