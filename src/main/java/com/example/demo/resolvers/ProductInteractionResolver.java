package com.example.demo.resolvers;

import com.example.demo.models.Product;
import com.example.demo.services.ProductInteractionService;
import com.example.demo.utils.SecurityUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

@Controller
public class ProductInteractionResolver {

    @Autowired
    private ProductInteractionService interactionService;

    @MutationMapping
    public Product incrementProductViews(@Argument String id) {
        return interactionService.incrementProductViews(id);
    }
    
    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Product toggleProductFavorite(@Argument String id) {
        String username = SecurityUtils.getCurrentUsername();
        return interactionService.toggleProductFavorite(id, username);
    }
}
