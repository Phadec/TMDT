package com.example.choviet.consumer;

import static com.example.choviet.config.Constants.*;

import com.example.choviet.dto.LoginEvent;
import com.example.choviet.service.EmailService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class NotificationConsumer {
    @Autowired
    private EmailService emailService;

    @RabbitListener(queues = LOGIN_QUEUE_LISTENER)
    public void handleLoginEvent(LoginEvent event) {
        try {
            String title = "Đăng nhập thành công Chợ Việt";

            String content = "Chào bạn, bạn đã đăng nhập thành công Chợ Việt\n" + "Ngày: " + getDate(event.getCreatedAt()) + "\nLúc: " + getTime(event.getCreatedAt()) + "\nNếu không phải bạn vui lòng liên hệ với chúng tôi qua hotline 113";


            emailService.sendNotification(event.getUserDto().getEmail(), title, content);
        } catch (Exception e) {
            // Log lỗi nếu cần
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    @RabbitListener(queues = REGISTER_QUEUE_LISTENER)
    public void handleRegisterEvent(LoginEvent event) {
        try {
            String title = "Đăng ký thành công Chợ Việt";
            String content = "Chào bạn, bạn đã đăng ký thành công Chợ Việt\n" + "Ngày: " + getDate(event.getCreatedAt())+ "\nLúc: " + getTime(event.getCreatedAt()) + "\nHãy thỏa sức tiêu tiền với chúng tôi cùng với trải nghiệm tuyệt vời";

            emailService.sendNotification(event.getUserDto().getEmail(), title, content);
        } catch (Exception e) {
            // Log lỗi nếu cần
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    @RabbitListener(queues = LOGOUT_QUEUE_LISTENER)
    public void handleLogoutEvent(LoginEvent event) {
        try {
            String title = "Đăng xuất thành công Chợ Việt";
            String content = "Chào bạn, bạn đã đăng xuất thành công Chợ Việt\n" + "Ngày: " + getDate(event.getCreatedAt()) + "\nLúc: " + getTime(event.getCreatedAt()) + "\nNếu không phải bạn vui lòng liên hệ với chúng tôi qua hotline 113";

            emailService.sendNotification(event.getUserDto().getEmail(), title, content);
        } catch (Exception e) {
            // Log lỗi nếu cần
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    @RabbitListener(queues = CHANGE_PASSWORD_QUEUE_LISTENER)
    @RabbitListener(queues = FORGOT_PASSWORD_QUEUE_LISTENER)
    public void handleChangePasswordEvent(LoginEvent event) {
        try {
            String title = "Đổi mật khẩu thành công Chợ Việt";
            String content = "Chào bạn, bạn đã đổi mật khẩu thành công Chợ Việt\n" + "Ngày: " + getDate(event.getCreatedAt()) + "\nLúc: " + getTime(event.getCreatedAt()) + "\nNếu không phải bạn vui lòng liên hệ với chúng tôi qua hotline 113";

            emailService.sendNotification(event.getUserDto().getEmail(), title, content);
        } catch (Exception e) {
            // Log lỗi nếu cần
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    @RabbitListener(queues = VERIFY_EMAIL_QUEUE_LISTENER)
    public void handleVerifyEmailEvent(LoginEvent event) {
        try {
            String title = "Xác minh";
            String content = "Đây là mã xác minh: " + event.getAction() + "\nNgày: " + getDate(event.getCreatedAt()) + "\nLúc: " + getTime(event.getCreatedAt()) + "\nHết hạn sau 120s";

            emailService.sendNotification(event.getUserDto().getEmail(), title, content);
        } catch (Exception e) {
            // Log lỗi nếu cần
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    private String getDate(LocalDateTime timestamp){
        String formattedDate;
        if (timestamp != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            formattedDate = timestamp.format(formatter);
        } else {
            formattedDate = "N/A";
        }
        return formattedDate;
    }



    private String getTime(LocalDateTime timestamp){
        String formattedDate;
        if (timestamp != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
            formattedDate = timestamp.format(formatter);
        } else {
            formattedDate = "N/A";
        }
        return formattedDate;
    }



}