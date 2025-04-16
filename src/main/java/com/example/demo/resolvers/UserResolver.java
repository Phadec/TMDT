package com.example.demo.resolvers;

import com.example.demo.dtos.UserRequestDTO;
import com.example.demo.dtos.UserResponseDTO;
import com.example.demo.models.User;
import com.example.demo.security.SecurityUtils;
import com.example.demo.services.UserService;
import com.example.demo.services.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@Controller
public class UserResolver {

    @Autowired
    private UserService userService;
    
    @Autowired
    private ProductService productService;
    
    @QueryMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponseDTO> users() {
        return userService.getAllUsers();
    }

    @QueryMapping
    public UserResponseDTO user(@Argument String id) {
        return userService.getUserById(id);
    }

    @QueryMapping
    public UserResponseDTO userByUsername(@Argument String username) {
        try {
            UserResponseDTO user = userService.getUserByUsername(username);
            // Debug log to check what's coming back
            System.out.println("Found user: " + user.getUsername() + ", created at: " + user.getCreatedAt());
            return user;
        } catch (Exception e) {
            System.err.println("Error in userByUsername resolver: " + e.getMessage());
            e.printStackTrace();
            throw e; // re-throw to send the error to the client
        }
    }

    @QueryMapping
    public Integer totalSoldProductsByUsername(@Argument String username) {
        try {
            System.out.println("Direct query for total sold products by user: " + username);
            if (username == null || username.isEmpty()) {
                return 0;
            }
            int totalSold = productService.getTotalSoldProductsByUsername(username);
            System.out.println("Total sold products for " + username + ": " + totalSold);
            return totalSold;
        } catch (Exception e) {
            System.err.println("Error getting total sold products for user " + username + ": " + e.getMessage());
            e.printStackTrace();
            return 0;
        }
    }

    // Field resolver for totalSoldProducts field in User type
    @SchemaMapping(typeName = "User", field = "totalSoldProducts")
    public Integer getTotalSoldProducts(User user) {
        try {
            if (user == null || user.getUsername() == null) {
                return 0;
            }
            System.out.println("Calculating total sold products for User: " + user.getUsername());
            return productService.getTotalSoldProductsByUsername(user.getUsername());
        } catch (Exception e) {
            System.err.println("Error getting total sold products for User: " + e.getMessage());
            return 0; // Return 0 instead of throwing an exception
        }
    }

    // Field resolver for totalSoldProducts field in UserResponseDTO type
    @SchemaMapping(typeName = "UserResponseDTO", field = "totalSoldProducts")
    public Integer getUserResponseDTOTotalSoldProducts(UserResponseDTO userDTO) {
        try {
            if (userDTO == null || userDTO.getUsername() == null) {
                return 0;
            }
            System.out.println("Calculating total sold products for UserResponseDTO: " + userDTO.getUsername());
            return productService.getTotalSoldProductsByUsername(userDTO.getUsername());
        } catch (Exception e) {
            System.err.println("Error getting total sold products for UserResponseDTO: " + e.getMessage());
            return 0; // Return 0 instead of throwing an exception
        }
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public UserResponseDTO currentUser() {
        return userService.getCurrentUserProfile();
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public UserResponseDTO updateUser(@Argument UserRequestDTO input) {
        // Use getCurrentUsername directly since it's the same as user ID in our system
        String username = SecurityUtils.getCurrentUsername();
        return userService.updateUser(username, input);
    }
    
    // Handle date formatting for UserResponseDTO objects
    @SchemaMapping(typeName = "User", field = "createdAt")
    public String getCreatedAt(UserResponseDTO user) {
        try {
            if (user.getCreatedAt() == null) {
                return new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").format(new Date());
            }
            return user.getCreatedAt();
        } catch (Exception e) {
            System.err.println("Error formatting createdAt date: " + e.getMessage());
            return new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").format(new Date());
        }
    }

    @SchemaMapping(typeName = "User", field = "updatedAt")
    public String getUpdatedAt(UserResponseDTO user) {
        try {
            if (user.getUpdatedAt() == null) {
                return new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").format(new Date());
            }
            return user.getUpdatedAt();
        } catch (Exception e) {
            System.err.println("Error formatting updatedAt date: " + e.getMessage());
            return new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").format(new Date());
        }
    }
}
