package com.example.choviet.service;

import com.example.choviet.entity.User;
import com.example.choviet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    /**
     * Lấy tất cả người dùng với phân trang
     */
    public Page<User> getAllUsersPaging(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return userRepository.findAll(pageable);
    }    /**
     * Lấy người dùng theo ID
     */
    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    /**
     * Cập nhật trạng thái người dùng
     */
    public User updateUserStatus(String id, String status) {
        User user = getUserById(id);
        user.setStatus(User.Status.valueOf(status.toUpperCase()));
        return userRepository.save(user);
    }

    /**
     * Xóa người dùng
     */
    public void deleteUser(String id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }

}
