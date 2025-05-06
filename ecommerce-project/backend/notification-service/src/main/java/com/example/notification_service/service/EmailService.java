package com.example.notification_service.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    public void sendLoginNotification(String toEmail, String timestamp) throws MessagingException {
        System.out.println("...sending email");

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(toEmail);
        helper.setSubject("Đăng nhập thành công vào Chợ Việt");
        helper.setText(String.format(
                "Chào bạn,\n\nBạn đã đăng nhập vào hệ thống Chợ Việt lúc %s.\nNếu không phải bạn, vui lòng liên hệ hỗ trợ.\n\nTrân trọng,\nChợ Việt",
                timestamp
        ));

        mailSender.send(message);
    }
}