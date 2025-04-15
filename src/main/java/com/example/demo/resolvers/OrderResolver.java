package com.example.demo.resolvers;

import com.example.demo.models.Order;
import com.example.demo.models.OrderItem;  // Add this import
import com.example.demo.dtos.OrderInput;
import com.example.demo.services.OrderService;
import com.example.demo.utils.SecurityUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.UUID;

@Controller
public class OrderResolver {

    @Autowired
    private OrderService orderService;

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<Order> orders(@Argument String username) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        if (!currentUsername.equals(username)) {
            throw new RuntimeException("You can only access your own orders");
        }
        
        return orderService.getOrdersByUsername(username);
    }
    
    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public Order order(@Argument String id) {
        Order order = orderService.getOrderById(id);
        String currentUsername = SecurityUtils.getCurrentUsername();
        
        if (!currentUsername.equals(order.getUsername())) {
            throw new RuntimeException("You can only access your own orders");
        }
        
        return order;
    }
    
    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<Order> sellerOrders() {
        String currentUsername = SecurityUtils.getCurrentUsername();
        System.out.println("Fetching seller orders for username: " + currentUsername);
        
        try {
            List<Order> orders = orderService.getOrdersForSeller(currentUsername);
            System.out.println("Found " + orders.size() + " orders for seller: " + currentUsername);
            return orders;
        } catch (Exception e) {
            System.err.println("Error fetching seller orders: " + e.getMessage());
            e.printStackTrace();
            // Return empty list instead of throwing an exception to avoid GraphQL errors
            return List.of();
        }
    }
    
    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public Order sellerOrderDetail(@Argument String id) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        System.out.println("Fetching seller order detail: " + id + " for seller: " + currentUsername);
        
        try {
            Order order = orderService.getSellerOrderDetail(id, currentUsername);
            
            // Make sure all order items have an ID
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    if (item.getId() == null) {
                        item.setId(UUID.randomUUID().toString());
                    }
                }
            }
            
            System.out.println("Successfully retrieved order: " + order.getId());
            return order;
        } catch (Exception e) {
            System.err.println("Error fetching seller order detail: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Order createOrder(@Argument OrderInput input) {
        String username = SecurityUtils.getCurrentUsername();
        if (username == null) {
            throw new RuntimeException("User must be authenticated to create an order");
        }
        
        System.out.println("Create order mutation called by: " + username);
        System.out.println("Order input: " + input);
        
        return orderService.createOrder(input, username);
    }
    
    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Order updateOrderStatus(@Argument String id, @Argument String status) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        
        try {
            // First try to update as a buyer
            Order order = orderService.getOrderById(id);
            if (currentUsername.equals(order.getUsername())) {
                return orderService.updateOrderStatus(id, status);
            }
        } catch (Exception e) {
            // Ignore the exception and try as a seller
        }
        
        // Try to update as a seller
        return orderService.updateOrderStatus(id, status);
    }
    
    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Order cancelOrder(@Argument String id) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        
        try {
            // First try to cancel as a buyer
            Order order = orderService.getOrderById(id);
            if (currentUsername.equals(order.getUsername())) {
                return orderService.cancelOrder(id);
            }
        } catch (Exception e) {
            // Ignore the exception and try as a seller
        }
        
        // Try to cancel as a seller
        return orderService.cancelOrderBySeller(id, currentUsername);
    }
}
