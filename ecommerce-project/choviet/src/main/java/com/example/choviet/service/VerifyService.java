package com.example.choviet.service;
import static com.example.choviet.config.ConfigTopicUser.*;
import static com.example.choviet.config.Constants.*;
import static com.example.choviet.config.envent.EventNameConfig.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

import com.example.choviet.dto.EmailRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.choviet.dto.AuthResponse;
import com.example.choviet.dto.Event;
import com.example.choviet.dto.VerifyEmailRequest;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
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
        event.setAction(EMAIL_VERIFICATION_SENT);

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
        
        // Đẩy event xác thực thành công vào queue
        AuthResponse response = new AuthResponse();
        response.setEmail(email);
        response.setCreatedAt(LocalDateTime.now());
        
        Event<AuthResponse> event = new Event<>();
        event.setData(response);
        event.setCreatedAt(LocalDateTime.now());
        event.setAction(EMAIL_VERIFICATION_SUCCESS);
        
        eventPublisher.pushToQueue(event, USER_EXCHANGE, VERIFY_EMAIL_QUEUE);
        
        return email;
    }

    String generateOTP() {
        SecureRandom random = new SecureRandom();
        int otp = random.nextInt(900000) + 100000; // Tạo số ngẫu nhiên từ 100000 đến 999999
        return String.valueOf(otp);
    }

    public String sendEmail(EmailRequest emailRequest) {
        Event<EmailRequest> event = new Event<>();
        event.setData(emailRequest);
        event.setCreatedAt(LocalDateTime.now());
        event.setAction(EMAIL_CONTACT);
        eventPublisher.pushToQueue(event, USER_EXCHANGE, CONTACT_EMAIL_QUEUE);
        return "Liên hệ thành công. Chúng tôi sẽ phản hồi qua email của bạn";
    }
}