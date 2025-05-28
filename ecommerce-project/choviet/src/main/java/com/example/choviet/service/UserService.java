package com.example.choviet.service;
import com.example.choviet.dto.*;
import com.example.choviet.entity.RefreshToken;
import com.example.choviet.entity.Role;
import com.example.choviet.entity.User;
import com.example.choviet.exception.TokenRefreshException;
import com.example.choviet.repository.RoleRepository;
import com.example.choviet.repository.UserRepository;
import com.example.choviet.utils.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static com.example.choviet.config.ConfigTopicUser.*;

@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public LoginResponse login(LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new IllegalArgumentException("Email and password are required");
        }

        // Find user by username
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            throw new RuntimeException("Invalid email or password");
        }

        User user = userOptional.get();

        // Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        // Generate access token
        String accessToken;
        if (user.getRole() != null) {
            accessToken = jwtUtil.generateTokenWithRole(user.getEmail(), user.getRole().getRoleName());
        } else {
            accessToken = jwtUtil.generateToken(user.getEmail());
        }

        // Generate refresh token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        try {
            // Store session in Redis
            redisTemplate.opsForValue().set(user.getId(), accessToken, 1, TimeUnit.HOURS);
        } catch (Exception e) {
            logger.warn("Failed to save session to Redis: {}. This won't affect authentication.", e.getMessage());
            // Continue even if Redis fails
        }

        // đẩy vào queue
        UserDto userDto = new UserDto();
        userDto.setEmail(user.getEmail());

        UserEvent event = new UserEvent();
        event.setUserDto(userDto);
        event.setAction("USER_LOGIN");
        event.setCreatedAt(LocalDateTime.now());
        pushToQueue(event, LOGIN_QUEUE);

        // Create response
        LoginResponse response = new LoginResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setRefreshToken(refreshToken.getToken());

        if (user.getRole() != null) {
            response.setRoleName(user.getRole().getRoleName());
            response.setPermissions(user.getRole().getPermissions());
        }

        return response;
    }

    @Transactional
    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    // Create new access token
                    String accessToken;
                    if (user.getRole() != null) {
                        accessToken = jwtUtil.generateTokenWithRole(user.getEmail(), user.getRole().getRoleName());
                    } else {
                        accessToken = jwtUtil.generateToken(user.getEmail());
                    }

                    // Invalidate old refresh token
                    refreshTokenService.invalidateToken(requestRefreshToken);

                    // Create new refresh token
                    RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user.getId());

                    return new TokenRefreshResponse(accessToken, newRefreshToken.getToken());
                })
                .orElseThrow(() -> new TokenRefreshException("Refresh token is not in database!"));
    }

    @Transactional
    public UserDto register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Assign default staff role
        Optional<Role> staffRole = roleRepository.findByRoleName("STAFF");
        if (staffRole.isPresent()) {
            user.setRole(staffRole.get());
        } else {
            throw new RuntimeException("Default role not found");
        }

        // Save user
        User savedUser = userRepository.save(user);

        // Create and return UserDto
        UserDto userDto = new UserDto();
        userDto.setId(savedUser.getId());
        userDto.setEmail(savedUser.getEmail());
        userDto.setCreatedAt(savedUser.getCreatedAt());
        userDto.setUpdatedAt(savedUser.getUpdatedAt());

        if (savedUser.getRole() != null) {
            userDto.setRoleName(savedUser.getRole().getRoleName());
        }

        // đẩy vào queue
        UserEvent event = new UserEvent();
        event.setUserDto(userDto);
        event.setAction("USER_REGISTER");
        event.setCreatedAt(LocalDateTime.now());
        pushToQueue(event, REGISTER_QUEUE);

        return userDto;
    }

    @Transactional
    public UserDto updateProfile(String userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // If changing email, check if new email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        // If current password is provided, check it and update to new password
        if (request.getCurrentPassword() != null && !request.getCurrentPassword().isEmpty()) {
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new RuntimeException("Current password is incorrect");
            }

            if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            }
        }

        // Update user details
        user.setEmail(request.getEmail());

        // Save updated user
        User savedUser = userRepository.save(user);

        // Create and return UserDto
        UserDto userDto = new UserDto();
        userDto.setId(savedUser.getId());
        userDto.setEmail(savedUser.getEmail());
        userDto.setCreatedAt(savedUser.getCreatedAt());
        userDto.setUpdatedAt(savedUser.getUpdatedAt());

        if (savedUser.getRole() != null) {
            userDto.setRoleName(savedUser.getRole().getRoleName());
        }

        return userDto;
    }

    public UserDto getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setEmail(user.getEmail());
        userDto.setCreatedAt(user.getCreatedAt());
        userDto.setUpdatedAt(user.getUpdatedAt());

        if (user.getRole() != null) {
            userDto.setRoleName(user.getRole().getRoleName());
        }

        return userDto;
    }

    @Transactional
    public void logout(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            // Delete session from Redis
            redisTemplate.delete("session:" + userId);
        } catch (Exception e) {
            logger.warn("Failed to delete session from Redis: {}. This won't affect logout.", e.getMessage());
        }

        try {
            // Invalidate all refresh tokens for the user
            refreshTokenService.invalidateAllUserTokens(user);
        } catch (Exception e) {
            logger.error("Failed to invalidate refresh tokens: {}", e.getMessage());
            throw new RuntimeException("Error during logout process");
        }


        // đẩy vào queue
        UserDto userDto = new UserDto();
        userDto.setEmail(user.getEmail());
        UserEvent event = new UserEvent();
        event.setUserDto(userDto);
        event.setAction("USER_LOGOUT");
        event.setCreatedAt(LocalDateTime.now());
        pushToQueue(event, LOGOUT_QUEUE);
    }

    // đổi mật khẩu

    public UserDto changePassword(ChangePasswordRequest changePasswordRequest){
        String userId = changePasswordRequest.getUserId();
        String oldPassword = changePasswordRequest.getOldPassword();
        String newPassword = changePasswordRequest.getNewPassword();
        String againNewPassword = changePasswordRequest.getReNewPassword();
        String email = changePasswordRequest.getEmail();

        if(!newPassword.equals(againNewPassword)) {
            throw new IllegalArgumentException("New password does not match the confirmation password");
        }else if(newPassword.equals(oldPassword)){
            throw new IllegalArgumentException("New password match the old password");
        }


        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Wrong password");
        }

        if(!user.getEmail().equals(email)){
            throw new RuntimeException("Wrong email");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setEmail(user.getEmail());
        userDto.setCreatedAt(user.getCreatedAt());
        userDto.setUpdatedAt(user.getUpdatedAt());

        // đẩy vào queue
        UserEvent event = new UserEvent();
        event.setUserDto(userDto);
        event.setAction("USER_CHANGE_PASSWORD");
        event.setCreatedAt(LocalDateTime.now());
        pushToQueue(event, CHANGE_PASSWORD_QUEUE);

        return userDto;
    }


    public UserDto forgotPassword(ChangePasswordRequest changePasswordRequest){
        String userId = changePasswordRequest.getUserId();
        String newPassword = changePasswordRequest.getNewPassword();
        String againNewPassword = changePasswordRequest.getReNewPassword();
        String email = changePasswordRequest.getEmail();

        if(!newPassword.equals(againNewPassword)) {
            throw new IllegalArgumentException("New password does not match the confirmation password");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(!user.getEmail().equals(email)){
            throw new RuntimeException("Wrong email");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setEmail(user.getEmail());
        userDto.setCreatedAt(user.getCreatedAt());
        userDto.setUpdatedAt(user.getUpdatedAt());

        // đẩy vào queue
        UserEvent event = new UserEvent();
        event.setUserDto(userDto);
        event.setAction("USER_FORGET_PASSWORD");
        event.setCreatedAt(LocalDateTime.now());
        pushToQueue(event, FORGOT_PASSWORD_QUEUE);

        return userDto;
    }

    // đẩy vào queue của rabbitmq
    private void pushToQueue(UserEvent event, String queue){
        try {
            rabbitTemplate.convertAndSend(USER_EXCHANGE, queue, event);
        } catch (Exception e) {
            logger.debug("Failed to send login event: {}. This is not critical.", e.getMessage());
        }
    }

}