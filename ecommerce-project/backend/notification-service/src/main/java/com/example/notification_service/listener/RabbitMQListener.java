package com.example.notification_service.listener;

import com.example.notification_service.config.Constants;
import com.example.notification_service.dto.LoginEvent;
import com.example.notification_service.service.EmailService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class RabbitMQListener {

    @Autowired
    private EmailService emailService;

    @RabbitListener(queues = Constants.LOGIN_QUEUE_LISTENER)
    public void handleLoginEvent(LoginEvent event) {
        try {
            String title = "Đăng nhập thành công Chợ Việt";

            String content = "Chào bạn, bạn đã đăng nhập thành công Chợ Việt\n" + "Ngày: " + getDate(event.getTimestamp()) + "\nLúc: " + getTime(event.getTimestamp()) + "\nNếu không phải bạn vui lòng liên hệ với chúng tôi qua hotline 113";


            emailService.sendNotification(event.getEmail(), title, content);
        } catch (Exception e) {
            // Log lỗi nếu cần
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    @RabbitListener(queues = Constants.REGISTER_QUEUE_LISTENER)
    public void handleRegisterEvent(LoginEvent event) {
        try {
            String title = "Đăng ký thành công Chợ Việt";
            String content = "Chào bạn, bạn đã đăng ký thành công Chợ Việt\n" + "Ngày: " + getDate(event.getTimestamp())+ "\nLúc: " + getTime(event.getTimestamp()) + "\nHãy thỏa sức tiêu tiền với chúng tôi cùng với trải nghiệm tuyệt vời";

            emailService.sendNotification(event.getEmail(), title, content);
        } catch (Exception e) {
            // Log lỗi nếu cần
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    @RabbitListener(queues = Constants.LOGOUT_QUEUE_LISTENER)
    public void handleLogoutEvent(LoginEvent event) {
        try {
            String title = "Đăng xuất thành công Chợ Việt";
            String content = "Chào bạn, bạn đã đăng xuất thành công Chợ Việt\n" + "Ngày: " + getDate(event.getTimestamp()) + "\nLúc: " + getTime(event.getTimestamp()) + "\nNếu không phải bạn vui lòng liên hệ với chúng tôi qua hotline 113";

            emailService.sendNotification(event.getEmail(), title, content);
        } catch (Exception e) {
            // Log lỗi nếu cần
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    @RabbitListener(queues = Constants.CHANGE_PASSWORD_QUEUE_LISTENER)
    @RabbitListener(queues = Constants.FORGOT_PASSWORD_QUEUE_LISTENER)
    public void handleChangePasswordEvent(LoginEvent event) {
        try {
            String title = "Đổi mật khẩu thành công Chợ Việt";
            String content = "Chào bạn, bạn đã đổi mật khẩu thành công Chợ Việt\n" + "Ngày: " + getDate(event.getTimestamp()) + "\nLúc: " + getTime(event.getTimestamp()) + "\nNếu không phải bạn vui lòng liên hệ với chúng tôi qua hotline 113";

            emailService.sendNotification(event.getEmail(), title, content);
        } catch (Exception e) {
            // Log lỗi nếu cần
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    @RabbitListener(queues = Constants.VERIFY_EMAIL_QUEUE_LISTENER)
    public void handleVerifyEmailEvent(LoginEvent event) {
        try {
            String title = "Xác minh";
            String content = "Đây là mã xác minh: " + event.getAction() + "\nNgày: " + getDate(event.getTimestamp()) + "\nLúc: " + getTime(event.getTimestamp()) + "\nHết hạn sau 120s";

            emailService.sendNotification(event.getEmail(), title, content);
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