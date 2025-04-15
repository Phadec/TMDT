package com.example.demo.resolvers;

import com.example.demo.models.FavoriteProduct;
import com.example.demo.repositories.FavoriteProductRepository;
import com.example.demo.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.Collections;
import java.util.List;

@Controller
public class FavoriteProductResolver {

    @Autowired
    private FavoriteProductRepository favoriteProductRepository;

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<FavoriteProduct> userFavorites() {
        // Get the current authenticated username
        String username = SecurityUtils.getCurrentUsername();
        
        if (username == null) {
            // Return empty list instead of null to avoid GraphQL error
            return Collections.emptyList();
        }
        
        // Find all favorite products for the current user
        return favoriteProductRepository.findByUsername(username);
    }
}
