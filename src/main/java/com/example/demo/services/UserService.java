package com.example.demo.services;

import org.springframework.stereotype.Service;

import com.example.demo.dtos.UserRequestDTO;
import com.example.demo.dtos.UserResponseDTO;
import com.example.demo.exceptions.BadRequestException;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.models.User;
import com.example.demo.repositories.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Date;
import java.util.stream.Collectors;
import org.modelmapper.ModelMapper;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ModelMapper modelMapper;

    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
            .map(user -> modelMapper.map(user, UserResponseDTO.class))
            .collect(Collectors.toList());
    }

    // Private method to get User entity
    private User findUserById(String id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserResponseDTO updateUser(String id, UserRequestDTO userRequest) {
        User existingUser = findUserById(id);
        
        userRepository.findByEmail(userRequest.getEmail())
            .ifPresent(user -> {
                if (!user.getId().equals(id)) {
                    throw new BadRequestException("Email already exists");
                }
            });
        
        modelMapper.map(userRequest, existingUser);
        existingUser.setUpdatedAt(new Date());
        User updatedUser = userRepository.save(existingUser);
        return modelMapper.map(updatedUser, UserResponseDTO.class);
    }

    public void deleteUser(String id) {
        User user = findUserById(id);
        userRepository.delete(user);
    }

    public void updateLoginStatus(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));
        
        user.setLastLoginAt(new Date());
        user.setLoginAttempts(0);
        userRepository.save(user);
    }

    public void incrementLoginAttempts(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));
        
        user.setLoginAttempts(user.getLoginAttempts() + 1);
        user.setLastLoginAttemptAt(new Date());
        
        // Disable account after 5 failed attempts
        if (user.getLoginAttempts() >= 5) {
            user.setEnabled(false);
        }
        
        userRepository.save(user);
    }

    public void enableUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));
        
        user.setEnabled(true);
        user.setLoginAttempts(0);
        userRepository.save(user);
    }

    public void disableUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));
        
        user.setEnabled(false);
        userRepository.save(user);
    }
    
    public User getUserById(String id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
