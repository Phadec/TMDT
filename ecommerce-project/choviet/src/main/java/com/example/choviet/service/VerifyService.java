package com.example.choviet.service;
import com.example.choviet.dto.AuthResponse;
import com.example.choviet.dto.Event;
import com.example.choviet.dto.VerifyEmailRequest;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import static com.example.choviet.config.Constants.*;
import static com.example.choviet.config.ConfigTopicUser.*;
@FieldDefaults(level = AccessLevel.PRIVATE)
@Service
public class VerifyService {
    @Autowired
    RedisService redisService;
    @Autowired
    RabbitMQService eventPublisher;

    public String sendVerificationEmail(String email){
        if(redisService.isKeyExists(email)) throw new RuntimeException("Token has sent");

        String token = generateOTP();
        AuthResponse userDto = new AuthResponse();
        userDto.setEmail(email);

        Event<AuthResponse> event = new Event<>();
        event.setData(userDto);
        event.setCreatedAt(LocalDateTime.now());
        event.setAction(token);

        eventPublisher.pushToQueue(event, USER_EXCHANGE, VERIFY_EMAIL_QUEUE);
        redisService.set(email, token, EMAIL_TOKEN_EXPIRY_MINUTES, TimeUnit.MINUTES);
        return "Đã gửi OTP";
    }

    public String validateEmailToken(VerifyEmailRequest verifyEmailRequest){
        String email = verifyEmailRequest.getEmail();
        String token = verifyEmailRequest.getToken();

        if(!redisService.isKeyExists(email)) throw new RuntimeException("Token has expired or not any token was sent");

        String storedToken = (String) redisService.get(email);

        // So sánh token người dùng nhập với token lưu trong Redis
        if (!storedToken.equals(token)) {
            throw new IllegalArgumentException("Invalid token");
        }

        // Token hợp lệ, xóa key khỏi Redis
        redisService.delete(email);
        return email;
    }

    String generateOTP() {
        SecureRandom random = new SecureRandom();
        int otp = random.nextInt(900000) + 100000; // Tạo số ngẫu nhiên từ 100000 đến 999999
        return String.valueOf(otp);
    }
}