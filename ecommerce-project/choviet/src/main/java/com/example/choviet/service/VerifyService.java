package com.example.choviet.service;
import com.example.choviet.dto.UserDto;
import com.example.choviet.dto.UserEvent;
import com.example.choviet.dto.VerifyEmailRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

import static com.example.choviet.config.Constants.*;
import static com.example.choviet.config.ConfigTopicUser.*;

@Service
public class VerifyService {
    private static final Logger logger = LoggerFactory.getLogger(VerifyService.class);

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void sendVerificationEmail(String email){
        String token = generateOTP();
        UserDto userDto = new UserDto();
        userDto.setEmail(email);

        UserEvent event = new UserEvent();
        event.setUserDto(userDto);
        event.setCreatedAt(LocalDateTime.now());
        event.setAction(token);

        rabbitTemplate.convertAndSend(USER_EXCHANGE, VERIFY_EMAIL_QUEUE, event);

        try {
            redisTemplate.opsForValue().set(email, token, EMAIL_TOKEN_EXPIRY_MINUTES, TimeUnit.MINUTES);
        } catch (Exception e) {
            logger.warn("Failed to save session to Redis: {}. This won't affect authentication.", e.getMessage());
        }
    }

    public boolean validateEmailToken(VerifyEmailRequest verifyEmailRequest){
        String email = verifyEmailRequest.getEmail();
        String token = verifyEmailRequest.getToken();

        Object storedToken = redisTemplate.opsForValue().get(email);

        if (storedToken == null) {
            throw new IllegalArgumentException("Invalid token or token has expired");
        }

        // So sánh token người dùng nhập với token lưu trong Redis
        if (!storedToken.toString().equals(token)) {
            throw new IllegalArgumentException("Invalid token");
        }

        // Token hợp lệ, xóa key khỏi Redis
        redisTemplate.delete(email);
        return true;
    }

    private String generateOTP() {
        SecureRandom random = new SecureRandom();
        int otp = random.nextInt(900000) + 100000; // Tạo số ngẫu nhiên từ 100000 đến 999999
        return String.valueOf(otp);
    }
}