package com.example.demo.repositories;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.example.demo.models.User;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByResetPasswordToken(String token);
    Optional<User> findByVerificationToken(String token);
    
    // Add a debug query method
    @Query(value = "{ 'username' : ?0 }", fields = "{ 'username' : 1, 'enabled' : 1, 'emailVerified' : 1}")
    Optional<User> findDebugInfoByUsername(String username);
}
