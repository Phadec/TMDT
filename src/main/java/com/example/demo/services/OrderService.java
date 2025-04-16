package com.example.demo.services;

import com.example.demo.dtos.OrderInput;
import com.example.demo.dtos.OrderItemInput;
import com.example.demo.models.Order;
import com.example.demo.models.CustomerInfo;
import com.example.demo.models.OrderItem;
import com.example.demo.models.Product;
import com.example.demo.repositories.OrderRepository;
import com.example.demo.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CartService cartService;

    public List<Order> getOrdersByUsername(String username) {
        return orderRepository.findByUsername(username);
    }
    
    public Order getOrderById(String id) {
        return orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }
    
    public List<Order> getOrdersForSeller(String sellerUsername) {
        try {
            // Get all products by this seller
            List<Product> sellerProducts = productRepository.findBySellerUsername(sellerUsername);
            
            if (sellerProducts.isEmpty()) {
                System.out.println("No products found for seller: " + sellerUsername);
                return List.of(); // Return empty list if seller has no products
            }
            
            // Get product IDs from seller's products
            List<String> sellerProductIds = sellerProducts.stream()
                .map(Product::getId)
                .collect(Collectors.toList());
            
            System.out.println("Seller " + sellerUsername + " has " + sellerProductIds.size() + " products");
            System.out.println("Seller product IDs: " + sellerProductIds);
            
            // Get all orders
            List<Order> allOrders = orderRepository.findAll();
            System.out.println("Total orders in system: " + allOrders.size());
            
            // Check for null items in orders
            for (Order order : allOrders) {
                if (order.getItems() == null) {
                    System.out.println("WARNING: Order " + order.getId() + " has null items list!");
                    continue;
                }
                
                // Check for null products in items
                for (OrderItem item : order.getItems()) {
                    if (item.getProduct() == null) {
                        System.out.println("WARNING: Order " + order.getId() + " has an item with null product!");
                    }
                }
            }
            
            // Filter orders that contain at least one product from this seller
            List<Order> sellerOrders = allOrders.stream()
                .filter(order -> {
                    if (order.getItems() == null) {
                        return false;
                    }
                    
                    boolean hasSellerProduct = order.getItems().stream()
                        .anyMatch(item -> {
                            // Check for null product
                            if (item.getProduct() == null) {
                                return false;
                            }
                            
                            boolean matches = sellerProductIds.contains(item.getProduct().getId());
                            if (matches) {
                                System.out.println("Order " + order.getId() + " contains seller product: " + item.getProduct().getId());
                            }
                            return matches;
                        });
                    return hasSellerProduct;
                })
                .collect(Collectors.toList());
            
            System.out.println("Found " + sellerOrders.size() + " orders for seller " + sellerUsername);
            return sellerOrders;
        } catch (Exception e) {
            System.err.println("Error getting orders for seller: " + e.getMessage());
            e.printStackTrace();
            // Return empty list rather than throwing exception to avoid GraphQL error
            return List.of();
        }
    }
    
    public Order getSellerOrderDetail(String orderId, String sellerUsername) {
        Order order = getOrderById(orderId);
        
        // Get all products by this seller
        List<Product> sellerProducts = productRepository.findBySellerUsername(sellerUsername);
        
        if (sellerProducts.isEmpty()) {
            throw new RuntimeException("No products found for seller: " + sellerUsername);
        }
        
        // Get product IDs from seller's products
        List<String> sellerProductIds = sellerProducts.stream()
            .map(Product::getId)
            .collect(Collectors.toList());
        
        // Check if the order contains any product from this seller
        boolean containsSellerProduct = order.getItems().stream()
            .anyMatch(item -> sellerProductIds.contains(item.getProduct().getId()));
        
        if (!containsSellerProduct) {
            throw new RuntimeException("Order does not contain any product from this seller");
        }
        
        return order;
    }
    
    @Transactional
    public Order createOrder(OrderInput orderInput, String username) {
        System.out.println("Creating order for user: " + username);
        
        // Create a new order
        Order order = new Order();
        order.setUsername(username);
        order.setOrderNumber(generateOrderNumber());
        order.setStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());
        
        // Map customer info
        CustomerInfo customerInfo = new CustomerInfo();
        customerInfo.setFullName(orderInput.getCustomerInfo().getFullName());
        customerInfo.setEmail(orderInput.getCustomerInfo().getEmail());
        customerInfo.setPhone(orderInput.getCustomerInfo().getPhone());
        customerInfo.setAddress(orderInput.getCustomerInfo().getAddress());
        order.setCustomerInfo(customerInfo);
        
        // Map order items and deduct product quantities
        List<OrderItem> orderItems = new ArrayList<>();
        List<Product> productsToUpdate = new ArrayList<>();
        
        System.out.println("Processing " + orderInput.getItems().size() + " order items");
        
        for (OrderItemInput itemInput : orderInput.getItems()) {
            Optional<Product> productOpt = productRepository.findById(itemInput.getProductId());
            if (productOpt.isEmpty()) {
                throw new RuntimeException("Product not found with id: " + itemInput.getProductId());
            }
            
            Product product = productOpt.get();
            System.out.println("Found product: " + product.getTitle() + " with ID: " + product.getId());
            System.out.println("Current quantity: " + product.getQuantity() + ", Order quantity: " + itemInput.getQuantity());
            
            // Check if quantity is null and initialize if needed
            if (product.getQuantity() == null) {
                System.out.println("WARNING: Product quantity is null, initializing to default value (10)");
                product.setQuantity(10);
            }
            
            // Check if there's enough quantity available
            if (product.getQuantity() < itemInput.getQuantity()) {
                throw new RuntimeException("Not enough inventory for product: " + product.getTitle() + 
                    ". Available: " + product.getQuantity() + ", Requested: " + itemInput.getQuantity());
            }
            
            // Deduct quantity from product
            int oldQuantity = product.getQuantity();
            product.setQuantity(oldQuantity - itemInput.getQuantity());
            System.out.println("Updated product quantity from " + oldQuantity + " to " + product.getQuantity());
            
            // Increment soldQuantity
            int oldSoldQuantity = product.getSoldQuantity() != null ? product.getSoldQuantity() : 0;
            product.setSoldQuantity(oldSoldQuantity + itemInput.getQuantity());
            System.out.println("Updated product soldQuantity from " + oldSoldQuantity + 
                " to " + product.getSoldQuantity());
            
            productsToUpdate.add(product);
            
            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(itemInput.getQuantity());
            orderItem.setPrice(itemInput.getPrice());
            orderItems.add(orderItem);
        }
        
        order.setItems(orderItems);
        
        // Set other fields
        order.setTotalAmount(orderInput.getTotalAmount());
        order.setPaymentMethod(orderInput.getPaymentMethod());
        order.setNotes(orderInput.getNotes());
        
        // Set the new fields
        order.setSubtotal(orderInput.getSubtotal());
        order.setPromoCode(orderInput.getPromoCode());
        order.setDiscountAmount(orderInput.getDiscountAmount());
        
        // Save the order
        Order savedOrder = orderRepository.save(order);
        System.out.println("Order created with ID: " + savedOrder.getId());
        
        try {
            // Save updated product quantities
            List<Product> updatedProducts = productRepository.saveAll(productsToUpdate);
            System.out.println("Successfully updated quantities for " + updatedProducts.size() + " products:");
            for (Product product : updatedProducts) {
                System.out.println("- " + product.getTitle() + ": quantity now " + product.getQuantity() + 
                    ", soldQuantity now " + product.getSoldQuantity());
            }
        } catch (Exception e) {
            System.err.println("ERROR updating product quantities: " + e.getMessage());
            e.printStackTrace();
            throw e;  // Re-throw to roll back transaction
        }
        
        // Clear the cart after successful order
        cartService.clearCart(username);
        
        return savedOrder;
    }
    
    @Transactional
    public Order updateOrderStatus(String id, String status) {
        Order order = getOrderById(id);
        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }
    
    @Transactional
    public Order cancelOrder(String id) {
        Order order = getOrderById(id);
        
        // Only restore quantities if order is in PENDING or PROCESSING state
        if ("PENDING".equals(order.getStatus()) || "PROCESSING".equals(order.getStatus())) {
            // Restore product quantities
            restoreProductQuantities(order);
        }
        
        order.setStatus("CANCELLED");
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }
    
    @Transactional
    public Order cancelOrderBySeller(String orderId, String sellerUsername) {
        // First verify that the seller owns at least one product in this order
        Order order = getSellerOrderDetail(orderId, sellerUsername);
        
        // Only restore quantities if order is in PENDING or PROCESSING state
        if ("PENDING".equals(order.getStatus()) || "PROCESSING".equals(order.getStatus())) {
            // For seller cancellations, only restore quantities for their own products
            restoreSellerProductQuantities(order, sellerUsername);
        }
        
        // Cancel the order
        order.setStatus("CANCELLED");
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }
    
    private String generateOrderNumber() {
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "ORD-" + datePrefix + "-" + randomSuffix;
    }
    
    // Helper method to restore all product quantities from an order
    private void restoreProductQuantities(Order order) {
        List<Product> productsToUpdate = new ArrayList<>();
        
        System.out.println("Restoring quantities for cancelled order: " + order.getId());
        
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product != null) {
                System.out.println("Restoring quantity for product: " + product.getId() + 
                    " (" + product.getTitle() + ")");
                
                // If product quantity is null, initialize it
                if (product.getQuantity() == null) {
                    product.setQuantity(0);
                }
                
                // Restore the quantity
                int newQuantity = product.getQuantity() + item.getQuantity();
                product.setQuantity(newQuantity);
                
                System.out.println("Updated quantity from " + product.getQuantity() + 
                    " to " + newQuantity);
                
                // Also decrement the soldQuantity
                int oldSoldQuantity = product.getSoldQuantity() != null ? product.getSoldQuantity() : 0;
                if (oldSoldQuantity >= item.getQuantity()) {
                    product.setSoldQuantity(oldSoldQuantity - item.getQuantity());
                    System.out.println("Updated soldQuantity from " + oldSoldQuantity + 
                        " to " + product.getSoldQuantity());
                }
                
                productsToUpdate.add(product);
            }
        }
        
        if (!productsToUpdate.isEmpty()) {
            try {
                // Save all updated products
                List<Product> updatedProducts = productRepository.saveAll(productsToUpdate);
                System.out.println("Successfully restored quantities for " + 
                    updatedProducts.size() + " products");
            } catch (Exception e) {
                System.err.println("ERROR restoring product quantities: " + e.getMessage());
                e.printStackTrace();
                throw e; // Re-throw to roll back transaction
            }
        }
    }
    
    // Helper method to restore only a seller's product quantities from an order
    private void restoreSellerProductQuantities(Order order, String sellerUsername) {
        List<Product> productsToUpdate = new ArrayList<>();
        
        System.out.println("Restoring quantities for seller's products in order: " + order.getId());
        
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            // Only restore for products owned by this seller
            if (product != null && sellerUsername.equals(product.getSellerUsername())) {
                System.out.println("Restoring quantity for product: " + product.getId() + 
                    " (" + product.getTitle() + ")");
                
                // If product quantity is null, initialize it
                if (product.getQuantity() == null) {
                    product.setQuantity(0);
                }
                
                // Restore the quantity
                int newQuantity = product.getQuantity() + item.getQuantity();
                product.setQuantity(newQuantity);
                
                System.out.println("Updated quantity from " + product.getQuantity() + 
                    " to " + newQuantity);
                
                // Also decrement the soldQuantity
                int oldSoldQuantity = product.getSoldQuantity() != null ? product.getSoldQuantity() : 0;
                if (oldSoldQuantity >= item.getQuantity()) {
                    product.setSoldQuantity(oldSoldQuantity - item.getQuantity());
                    System.out.println("Updated soldQuantity from " + oldSoldQuantity + 
                        " to " + product.getSoldQuantity());
                }
                
                productsToUpdate.add(product);
            }
        }
        
        if (!productsToUpdate.isEmpty()) {
            try {
                // Save all updated products
                List<Product> updatedProducts = productRepository.saveAll(productsToUpdate);
                System.out.println("Successfully restored quantities for " + 
                    updatedProducts.size() + " seller products");
            } catch (Exception e) {
                System.err.println("ERROR restoring seller product quantities: " + e.getMessage());
                e.printStackTrace();
                throw e; // Re-throw to roll back transaction
            }
        }
    }
}
