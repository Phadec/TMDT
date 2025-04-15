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
        
        // Nếu email được cung cấp và khác với email hiện tại, kiểm tra xem có bị trùng không
        if (userRequest.getPhoneNumber() != null) {
            existingUser.setPhoneNumber(userRequest.getPhoneNumber());
        }
        
        if (userRequest.getFirstName() != null) {
            existingUser.setFirstName(userRequest.getFirstName());
        }
        
        if (userRequest.getLastName() != null) {
            existingUser.setLastName(userRequest.getLastName());
        }
        
        // Chỉ cập nhật avatar nếu nó được cung cấp và không rỗng
        if (userRequest.getAvatar() != null && !userRequest.getAvatar().isEmpty()) {
            existingUser.setAvatar(userRequest.getAvatar());
        }
        
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
    
    public UserResponseDTO getUserById(String id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return modelMapper.map(user, UserResponseDTO.class);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
    
    // Method to update user avatar
    public User updateAvatar(User user) {
        user.setUpdatedAt(new Date());
        return userRepository.save(user);
    }

    public UserResponseDTO getUserByUsername(String username) {
        User user = findByUsername(username);
        return modelMapper.map(user, UserResponseDTO.class);
    }
}
