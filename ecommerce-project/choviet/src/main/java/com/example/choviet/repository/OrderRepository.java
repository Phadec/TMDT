package com.example.choviet.repository;
import com.example.choviet.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    Page<Order> findAllByCustomerId(String id, Pageable pageable);
    Page<Order> findAllByCustomerIdAndStatus(String id, Order.Status status, Pageable pageable);
    Page<Order> findAllByStatus(Order.Status status, Pageable pageable);
}