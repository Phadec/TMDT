package com.example.choviet.repository;

import com.example.choviet.entity.Cart;
import com.example.choviet.entity.Customer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends MongoRepository<Cart, String> {
    void deleteByCustomerIdAndId(String customerId, String id);

    Cart findByCustomerId(String id);
}

