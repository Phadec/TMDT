package com.example.choviet.service;
import com.example.choviet.dto.UserDto;
import com.example.choviet.dto.Event;
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
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    @Autowired
    private RabbitTemplate rabbitTemplate;
    @Autowired
    private EventPublisher eventPublisher;

    public String sendVerificationEmail(String email){
        String token = generateOTP();
        UserDto userDto = new UserDto();
        userDto.setEmail(email);

        Event<UserDto> event = new Event<>();
        event.setData(userDto);
        event.setCreatedAt(LocalDateTime.now());
        event.setAction(token);

        eventPublisher.pushToQueue(event, USER_EXCHANGE, VERIFY_EMAIL_QUEUE);
        redisTemplate.opsForValue().set(email, token, EMAIL_TOKEN_EXPIRY_MINUTES, TimeUnit.MINUTES);
        return "Đã gửi OTP";
    }

    public String validateEmailToken(VerifyEmailRequest verifyEmailRequest){
        String email = verifyEmailRequest.getEmail();
        String token = verifyEmailRequest.getToken();

        Object storedToken = redisTemplate.opsForValue().get(email);

        // So sánh token người dùng nhập với token lưu trong Redis
        if (!storedToken.toString().equals(token)) {
            throw new IllegalArgumentException("Invalid token");
        }

        // Token hợp lệ, xóa key khỏi Redis
        redisTemplate.delete(email);
        return email;
    }

    private String generateOTP() {
        SecureRandom random = new SecureRandom();
        int otp = random.nextInt(900000) + 100000; // Tạo số ngẫu nhiên từ 100000 đến 999999
        return String.valueOf(otp);
    }
}