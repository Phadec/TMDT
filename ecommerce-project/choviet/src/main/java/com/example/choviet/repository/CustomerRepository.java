package com.example.choviet.repository;

import com.example.choviet.entity.Customer;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CustomerRepository  extends MongoRepository<Customer, String> {
    Optional<Customer> findByEmail(String email);
    boolean existsByEmail(String email);
}
