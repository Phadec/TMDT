package com.example.demo.services;

import com.example.demo.repositories.ShoppingCartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShoppingCartService {
    @Autowired
    ShoppingCartRepository shoppingCartRepository;

    // Đếm số lượng sản phẩm của user này
    public long getCountOfProducts(String idUser) {
        return shoppingCartRepository.countByUserId(idUser);
    }

    public void saveProducts(String username, List<String> isProducts) {

    }
}
