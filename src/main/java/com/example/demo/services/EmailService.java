package com.example.demo.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String toEmail, String token) {
        try {
            String verificationUrl = frontendUrl + "/verify-email?token=" + token;
            
            String emailContent = String.format("""
                <html>
                <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
                    <div style="width: 100%%; max-width: 600px; margin: 0 auto; padding: 30px 20px; background-color: white; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h1 style="color: #3366cc; margin-bottom: 15px;">Xác Thực Email</h1>
                            <div style="height: 3px; background-color: #3366cc; width: 100px; margin: 0 auto;"></div>
                        </div>
                        <p style="color: #444; font-size: 16px; line-height: 1.5;">Kính gửi Quý khách,</p>
                        <p style="color: #444; font-size: 16px; line-height: 1.5;">Cảm ơn bạn đã đăng ký tài khoản. Vui lòng nhấp vào nút bên dưới để xác thực địa chỉ email của bạn:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s" style="display: inline-block; padding: 12px 25px; background-color: #3366cc; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                                Xác Thực Email
                            </a>
                        </div>
                        <p style="color: #666; font-size: 14px;">Hoặc sao chép đường dẫn này vào trình duyệt của bạn:</p>
                        <p style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 14px;">%s</p>
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 14px; text-align: center;">
                            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                            <p>&copy; 2023 Website của chúng tôi. Tất cả các quyền được bảo lưu.</p>
                        </div>
                    </div>
                </body>
                </html>
                """, verificationUrl, verificationUrl);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Verify your email address");
            helper.setText(emailContent, true);
            
            mailSender.send(message);
            logger.info("Verification email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send verification email: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to send verification email: " + e.getMessage(), e);
        }
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        try {
            logger.debug("Sending password reset email to {} with token: {}", toEmail, token.substring(0, Math.min(token.length(), 10)) + "...");
            
            String resetUrl = frontendUrl + "/reset-password?token=" + token;
            logger.debug("Reset password URL: {}", resetUrl);
            
            String emailContent = String.format("""
                <html>
                <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
                    <div style="width: 100%%; max-width: 600px; margin: 0 auto; padding: 30px 20px; background-color: white; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h1 style="color: #3366cc; margin-bottom: 15px;">Đặt Lại Mật Khẩu</h1>
                            <div style="height: 3px; background-color: #3366cc; width: 100px; margin: 0 auto;"></div>
                        </div>
                        <p style="color: #444; font-size: 16px; line-height: 1.5;">Kính gửi Quý khách,</p>
                        <p style="color: #444; font-size: 16px; line-height: 1.5;">Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhấp vào nút bên dưới để tiếp tục:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s" style="display: inline-block; padding: 12px 25px; background-color: #3366cc; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                                Đặt Lại Mật Khẩu
                            </a>
                        </div>
                        <p style="color: #666; font-size: 14px;">Hoặc sao chép đường dẫn này vào trình duyệt của bạn:</p>
                        <p style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 14px;">%s</p>
                        <p style="color: #444; font-size: 16px; margin-top: 20px;">Đường dẫn này sẽ hết hạn sau 1 giờ.</p>
                        <p style="color: #444; font-size: 16px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 14px; text-align: center;">
                            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                            <p>&copy; 2023 Website của chúng tôi. Tất cả các quyền được bảo lưu.</p>
                        </div>
                    </div>
                </body>
                </html>
                """, resetUrl, resetUrl);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Reset your password");
            helper.setText(emailContent, true);
            
            logger.debug("Preparing to send email: From={}, To={}, Subject='Reset your password'", fromEmail, toEmail);
            
            mailSender.send(message);
            logger.info("Password reset email sent successfully to: {}", toEmail);
        } catch (MessagingException e) {
            logger.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("Failed to send password reset email", e);
        } catch (Exception e) {
            logger.error("Unexpected error sending password reset email to {}: {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("Failed to send password reset email: " + e.getMessage(), e);
        }
    }
    
    public boolean testEmailConnection() {
        try {
            logger.info("Testing email connection...");
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(fromEmail);
            helper.setSubject("Test Email Connection");
            helper.setText("This is a test email to verify the email service is configured correctly.", false);
            mailSender.send(message);
            logger.info("Test email sent successfully");
            return true;
        } catch (Exception e) {
            logger.error("Test email failed: {}", e.getMessage(), e);
            return false;
        }
    }
}
