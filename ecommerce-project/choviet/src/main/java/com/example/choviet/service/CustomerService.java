package com.example.choviet.service;

import com.example.choviet.dto.AuthResponse;
import com.example.choviet.entity.Customer;
import com.example.choviet.mapper.CustomerMapper;
import com.example.choviet.repository.CustomerRepository;
import com.example.choviet.utils.JwtUtil;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
@FieldDefaults(level = AccessLevel.PRIVATE)
@Service
public class CustomerService {
    @Autowired
    CustomerRepository customerRepository;

    @Autowired
    JwtUtil jwtUtil;

    @Autowired
    RefreshTokenService refreshTokenService;
    @Autowired
    RedisService redisService;

    @Autowired
    RabbitMQService eventPublisher;
    @Autowired
    CustomerMapper customerMapper;
    @Autowired
    PagingService pagingService;


    // login
    // register
    // forgot pass
    // changepass

    final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Page<AuthResponse> getCustomerPaging(int page, int size) {
        Pageable pageable = pagingService.createPageable(page, size);
        Page<Customer> customers = customerRepository.findAll(pageable);

        if(page > customers.getTotalPages() && customers.getTotalPages() > 0){
            pageable = pagingService.createPageable(customers.getTotalPages() - 1, size);
            customers = customerRepository.findAll(pageable);
        }

        return customers.map(customerMapper::toDto);
    }
}
