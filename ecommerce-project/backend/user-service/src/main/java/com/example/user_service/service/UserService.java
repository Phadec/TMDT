package com.example.user_service.service;

import com.example.user_service.dto.LoginEvent;
import com.example.user_service.dto.LoginResponse;
import com.example.user_service.entity.User;
import com.example.user_service.repository.UserRepository;
import com.example.user_service.utils.JwtUtil;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
public class UserService {
    @Autowired
    private UserRepository repository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private RabbitTemplate rabbitTemplate;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User login(User request) {
        // Tìm user theo email
        Optional<User> userOptional = repository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            throw new RuntimeException("Invalid email or password");
        }

        User user = userOptional.get();

        // Kiểm tra password
        if (!request.getPassword().equals(user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Tạo JWT
//        String token = jwtUtil.generateToken(user.getEmail());

        // Lưu session vào Redis
        redisTemplate.opsForValue().set("session:" + user.getId(), "aomacanada", 1, TimeUnit.HOURS);

        // Gửi thông báo đăng nhập qua RabbitMQ
        LoginEvent event = new LoginEvent();
        event.setUserId(user.getId());
        event.setEmail(user.getEmail());
        event.setTimestamp(LocalDateTime.now());
        event.setAction("USER_LOGIN");
        rabbitTemplate.convertAndSend("login-queue", event);

        // Tạo response
        User response = new User();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        return response;
    }
}
