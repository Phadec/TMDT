package com.example.user_service.service;
import com.example.user_service.config.Constants;
import com.example.user_service.dto.UserEvent;
import com.example.user_service.dto.VerifyEmailRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.concurrent.TimeUnit;

@Service
public class VerifyService {
    private static final Logger logger = LoggerFactory.getLogger(VerifyService.class);

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void sendVerificationEmail(String email){
        String token = generateOTP();
        UserEvent event = new UserEvent();
        event.setEmail(email);
        event.setTimestamp(LocalDateTime.now());
        event.setAction(token);
        rabbitTemplate.convertAndSend(Constants.EXCHANGE, Constants.VERIFY_EMAIL_QUEUE, event);

        try {
            redisTemplate.opsForValue().set(email, token, Constants.EMAIL_TOKEN_EXPIRY_MINUTES, TimeUnit.MINUTES);
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