package com.example.demo.services;

import com.example.demo.repositories.ShoppingCartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ShoppingCartService {
    @Autowired
    ShoppingCartRepository shoppingCartRepository;

    public long getCountOfProducts(String idUser) {
        return shoppingCartRepository.countByUserId(idUser);
    }
}
