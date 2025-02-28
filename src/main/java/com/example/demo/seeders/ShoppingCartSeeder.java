package com.example.demo.seeders;

import com.example.demo.models.ShoppingCart;
import com.example.demo.repositories.ShoppingCartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ShoppingCartSeeder {

    @Autowired
    ShoppingCartRepository shoppingCartRepository;

    public void seed() {
        if(shoppingCartRepository.count() == 0) {

        }
    }

    private ShoppingCart createShoppingCart(String userId) {
        ShoppingCart shoppingCart = new ShoppingCart();
        return shoppingCartRepository.save(shoppingCart);
    }
}
