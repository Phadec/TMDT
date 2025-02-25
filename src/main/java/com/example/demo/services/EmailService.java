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

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String toEmail, String token) {
        try {
            String verificationUrl = baseUrl + "/api/auth/verify-email?token=" + token;
            
            String emailContent = String.format("""
                <html>
                <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif;">
                    <div style="width: 100%%; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: #333;">Email Verification</h1>
                        <p>Please click the link below to verify your email address:</p>
                        <p>
                            <a href="%s" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                                Verify Email Address
                            </a>
                        </p>
                        <p>Or copy this link: <br> %s</p>
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
            String resetUrl = baseUrl + "/reset-password?token=" + token;
            
            String emailContent = String.format("""
                <html>
                <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif;">
                    <div style="width: 100%%; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: #333;">Reset Your Password</h1>
                        <p>You have requested to reset your password. Please click the link below to set a new password:</p>
                        <p>
                            <a href="%s" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                                Reset Password
                            </a>
                        </p>
                        <p>Or copy this link: <br> %s</p>
                        <p>This link will expire in 1 hour.</p>
                        <p>If you didn't request this, please ignore this email.</p>
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
            
            mailSender.send(message);
            logger.info("Password reset email sent successfully to: {}", toEmail);
        } catch (MessagingException e) {
            logger.error("Failed to send password reset email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }
}
