package com.example.choviet.repository;

import com.example.choviet.entity.Customer;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CustomerRepository  extends MongoRepository<Customer, String> {

}
