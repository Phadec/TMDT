package com.example.demo.services;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.dtos.ForgotPasswordDTO;
import com.example.demo.dtos.LoginDTO;
import com.example.demo.dtos.RegisterDTO;
import com.example.demo.dtos.ResetPasswordDTO;
import com.example.demo.dtos.UserDTO;
import com.example.demo.exceptions.BadRequestException;
import com.example.demo.models.User;
import com.example.demo.repositories.UserRepository;
import com.example.demo.security.JwtUtils;

import java.util.Date;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtil;
    private final UserService userService;
    private final EmailService emailService;

    // ✅ Constructor-based injection (khuyến nghị)
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtil, UserService userService, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.emailService = emailService;
    }

  public Map<String, Object> register(RegisterDTO registerDTO) {
    // Convert username to lowercase before checking and saving
    String lowercaseUsername = registerDTO.getUsername().toLowerCase();
    registerDTO.setUsername(lowercaseUsername);

    if (userRepository.existsByEmail(registerDTO.getEmail())) {
        throw new BadRequestException("Email already exists");
    }
    if (userRepository.existsByUsername(lowercaseUsername)) {
        throw new BadRequestException("Username already exists");
    }

    User user = new User();
    user.setUsername(lowercaseUsername);
    user.setEmail(registerDTO.getEmail());
    user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
    user.setFirstName(registerDTO.getFirstName());
    user.setLastName(registerDTO.getLastName());
    user.setPhoneNumber(registerDTO.getPhoneNumber());
    user.setAvatar(registerDTO.getAvatar());
    user.setRole("USER");  // Set default role
    user.setCreatedAt(new Date());  // Set creation date
    user.setUpdatedAt(new Date());  // Set update date

    // Generate and set verification token
    String verificationToken = UUID.randomUUID().toString();
    user.setVerificationToken(verificationToken);
    user.setEmailVerified(false);

    User savedUser = userRepository.save(user);
    
    // Send verification email
    emailService.sendVerificationEmail(savedUser.getEmail(), verificationToken);

    String token = jwtUtil.generateJwtToken(savedUser.getUsername());

    UserDTO userDTO = UserDTO.builder()
            .id(savedUser.getId())
            .username(savedUser.getUsername())
            .email(savedUser.getEmail())
            .firstName(savedUser.getFirstName())
            .lastName(savedUser.getLastName())
            .phoneNumber(savedUser.getPhoneNumber())
            .avatar(savedUser.getAvatar())
            .role(savedUser.getRole())  // Include role in response
            .build();

    return Map.of(
        "token", token,
        "user", userDTO
    );
}

 public Map<String, Object> login(LoginDTO loginDTO) {
    // Convert username to lowercase before checking
    String lowercaseUsername = loginDTO.getUsername().toLowerCase();
    logger.debug("Attempting login for username: {}", lowercaseUsername);
    
    User user = userRepository.findByUsername(lowercaseUsername)
        .orElseThrow(() -> {
            logger.debug("User not found with username: {}", lowercaseUsername);
            return new BadRequestException("Invalid credentials");
        });

    logger.debug("User found: {}, enabled: {}, emailVerified: {}", 
        user.getUsername(), user.isEnabled(), user.isEmailVerified());

    if (!user.isEnabled()) {
        logger.debug("Account is disabled for user: {}", user.getUsername());
        throw new BadRequestException("Account is disabled");
    }

    if (!user.isEmailVerified()) {
        logger.debug("Email not verified for user: {}", user.getUsername());
        throw new BadRequestException("Email not verified");
    }

    if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
        logger.debug("Invalid password for user: {}", user.getUsername());
        userService.incrementLoginAttempts(user.getId());
        throw new BadRequestException("Invalid credentials");
    }

    logger.debug("Login successful for user: {}", user.getUsername());
    
    userService.updateLoginStatus(user.getId());
    
    String token = jwtUtil.generateJwtToken(user.getUsername());
    UserDTO userDTO = UserDTO.builder()
        .id(user.getId())
        .username(user.getUsername())
        .email(user.getEmail())
        .firstName(user.getFirstName())
        .lastName(user.getLastName())
        .phoneNumber(user.getPhoneNumber())
        .avatar(user.getAvatar())
        .role(user.getRole())
        .emailVerified(user.isEmailVerified())
        .enabled(user.isEnabled())
        .lastLoginAt(user.getLastLoginAt())
        .createdAt(user.getCreatedAt())
        .updatedAt(user.getUpdatedAt())
        .build();

    return Map.of(
        "token", token,
        "user", userDTO
    );
}

    public void forgotPassword(ForgotPasswordDTO forgotPasswordDTO) {
        User user = userRepository.findByEmail(forgotPasswordDTO.getEmail())
            .orElseThrow(() -> new BadRequestException("Email not found"));
        
        String token = generateResetToken(); // implement this method to generate a random token
        user.setResetPasswordToken(token);
        user.setResetPasswordExpires(new Date(System.currentTimeMillis() + 3600000)); // 1 hour
        userRepository.save(user);
        
        // Send password reset email
        emailService.sendPasswordResetEmail(user.getEmail(), token);
    }

    public void resetPassword(ResetPasswordDTO resetPasswordDTO) {
        User user = userRepository.findByResetPasswordToken(resetPasswordDTO.getToken())
            .orElseThrow(() -> new BadRequestException("Invalid or expired token"));

        if (user.getResetPasswordExpires().before(new Date())) {
            throw new BadRequestException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(resetPasswordDTO.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpires(null);
        userRepository.save(user);
    }

    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
            .orElseThrow(() -> new BadRequestException("Invalid verification token"));
        
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
    }

    public Optional<User> findByResetPasswordToken(String token) {
        return userRepository.findByResetPasswordToken(token);
    }

    public Optional<User> findByVerificationToken(String token) {
        return userRepository.findByVerificationToken(token);
    }

    private String generateResetToken() {
        // Implement a secure random token generation method
        return UUID.randomUUID().toString();
    }
}
