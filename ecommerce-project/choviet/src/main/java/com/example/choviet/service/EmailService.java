package com.example.choviet.service;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.stream.Collectors;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Service
public class EmailService {
    @Autowired
    JavaMailSender mailSender;
    
    @Autowired
    ResourceLoader resourceLoader;
    
    @Value("${spring.mail.username}")
    String fromEmail;

    public void sendNotification(String toEmail, String title, String content) throws MessagingException {
        System.out.println("...sending email notification");

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject(title);
        helper.setText(String.format(content));

        mailSender.send(message);
    }

    public void sendUserToAdmin(String fromEmail, String toEmail, String title, String content) throws MessagingException {
        System.out.println("...sending email notification");

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject(title);
        helper.setText(String.format(content));

        mailSender.send(message);
    }
    
    /**
     * Send an HTML email based on a template
     *
     * @param toEmail recipient email address
     * @param subject email subject
     * @param templatePath path to the HTML template in resources folder
     * @param templateData map of placeholder keys and their values to replace in the template
     * @throws MessagingException if there's an issue sending the email
     */
    public void sendHtmlEmail(String toEmail, String subject, String templatePath, Map<String, String> templateData) 
            throws MessagingException {
        System.out.println("...sending HTML email to " + toEmail);
        
        try {
            // Load the HTML template
            String htmlContent = loadTemplate(templatePath);
            
            // Replace placeholders with actual data
            for (Map.Entry<String, String> entry : templateData.entrySet()) {
                htmlContent = htmlContent.replace("{" + entry.getKey() + "}", entry.getValue());
            }
            
            // Create and send the email
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true indicates HTML content
            
            mailSender.send(message);
            System.out.println("Email sent successfully to " + toEmail);
        } catch (IOException e) {
            System.err.println("Error loading email template: " + e.getMessage());
            throw new RuntimeException("Failed to load email template", e);
        }
    }
    
    /**
     * Send a registration confirmation email
     *
     * @param toEmail recipient email address
     * @param fullName customer's full name
     * @throws MessagingException if there's an issue sending the email
     */
    public void sendRegistrationConfirmation(String toEmail, String fullName) throws MessagingException {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String formattedDate = LocalDateTime.now().format(formatter);
        
        Map<String, String> templateData = Map.of(
            "email", toEmail,
            "fullName", fullName,
            "registrationDate", formattedDate
        );
        
        sendHtmlEmail(
            toEmail,
            "Chào mừng đến với Chợ Việt - Đăng ký thành công!",
            "templates/email/registration-success.html",
            templateData
        );
    }
    
    /**
     * Load an email template from the resources folder
     *
     * @param templatePath path to the template in resources folder
     * @return the template content as a string
     * @throws IOException if the template cannot be read
     */
    private String loadTemplate(String templatePath) throws IOException {
        Resource resource = resourceLoader.getResource("classpath:" + templatePath);
        try (InputStream inputStream = resource.getInputStream();
             BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
            return reader.lines().collect(Collectors.joining("\n"));
        }
    }
}