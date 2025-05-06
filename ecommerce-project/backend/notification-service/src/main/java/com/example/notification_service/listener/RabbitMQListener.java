package com.example.notification_service.listener;

import com.example.notification_service.dto.LoginEvent;
import com.example.notification_service.service.EmailService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RabbitMQListener {

    @Autowired
    private EmailService emailService;

    @RabbitListener(queues = "login-queue")
    public void handleLoginEvent(LoginEvent event) {
        try {
            emailService.sendLoginNotification(event.getEmail(), event.getTimestamp().toString());
        } catch (Exception e) {
            // Log lỗi nếu cần
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }
}