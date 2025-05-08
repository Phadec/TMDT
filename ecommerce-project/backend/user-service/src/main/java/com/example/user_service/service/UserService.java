package com.example.user_service.service;

import com.example.user_service.config.Constants;
import com.example.user_service.dto.*;
import com.example.user_service.entity.RefreshToken;
import com.example.user_service.entity.Role;
import com.example.user_service.entity.User;
import com.example.user_service.exception.TokenRefreshException;
import com.example.user_service.repository.RoleRepository;
import com.example.user_service.repository.UserRepository;
import com.example.user_service.utils.JwtUtil;
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
        // Validate request
        if (request.getUsername() == null || request.getPassword() == null) {
            throw new IllegalArgumentException("Username and password are required");
        }

        // Find user by username
        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());
        if (userOptional.isEmpty()) {
            throw new RuntimeException("Invalid username or password");
        }

        User user = userOptional.get();

        // Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        // Generate access token
        String accessToken;
        if (user.getRole() != null) {
            accessToken = jwtUtil.generateTokenWithRole(user.getUsername(), user.getRole().getRoleName());
        } else {
            accessToken = jwtUtil.generateToken(user.getUsername());
        }

        // Generate refresh token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        try {
            // Store session in Redis
            redisTemplate.opsForValue().set("session:" + user.getId(), accessToken, 1, TimeUnit.HOURS);
        } catch (Exception e) {
            logger.warn("Failed to save session to Redis: {}. This won't affect authentication.", e.getMessage());
            // Continue even if Redis fails
        }

        // đẩy vào queue
        pushToQueue(user.getEmail(), "USER_LOGIN", Constants.LOGIN_QUEUE);

        // Create response
        LoginResponse response = new LoginResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
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
                        accessToken = jwtUtil.generateTokenWithRole(user.getUsername(), user.getRole().getRoleName());
                    } else {
                        accessToken = jwtUtil.generateToken(user.getUsername());
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

        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already taken");
        }

        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
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
        userDto.setUsername(savedUser.getUsername());
        userDto.setEmail(savedUser.getEmail());
        userDto.setCreatedAt(savedUser.getCreatedAt());
        userDto.setUpdatedAt(savedUser.getUpdatedAt());

        if (savedUser.getRole() != null) {
            userDto.setRoleName(savedUser.getRole().getRoleName());
        }

        // đẩy vào queue
        pushToQueue(user.getEmail(), "USER_REGISTER", Constants.REGISTER_QUEUE);

        return userDto;
    }

    @Transactional
    public UserDto updateProfile(Long userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // If changing email, check if new email already exists
        if (!user.getEmail().equals(request.getEmail()) &&
                userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        // If changing username, check if new username already exists
        if (!user.getUsername().equals(request.getUsername()) &&
                userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already taken");
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
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());

        // Save updated user
        User savedUser = userRepository.save(user);

        // Create and return UserDto
        UserDto userDto = new UserDto();
        userDto.setId(savedUser.getId());
        userDto.setUsername(savedUser.getUsername());
        userDto.setEmail(savedUser.getEmail());
        userDto.setCreatedAt(savedUser.getCreatedAt());
        userDto.setUpdatedAt(savedUser.getUpdatedAt());

        if (savedUser.getRole() != null) {
            userDto.setRoleName(savedUser.getRole().getRoleName());
        }

        return userDto;
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setUsername(user.getUsername());
        userDto.setEmail(user.getEmail());
        userDto.setCreatedAt(user.getCreatedAt());
        userDto.setUpdatedAt(user.getUpdatedAt());

        if (user.getRole() != null) {
            userDto.setRoleName(user.getRole().getRoleName());
        }

        return userDto;
    }

    @Transactional
    public void logout(Long userId) {
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
        pushToQueue( user.getEmail(), "USER_LOGOUT", Constants.LOGOUT_QUEUE);
    }

    // đổi mật khẩu

    public UserDto changePassword(ChangePasswordRequest changePasswordRequest){
        Long userId = changePasswordRequest.getUserId();
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

        // đẩy vào queue
        pushToQueue(user.getEmail(), "USER_CHANGE_PASSWORD", Constants.CHANGE_PASSWORD_QUEUE);

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setUsername(user.getUsername());
        userDto.setEmail(user.getEmail());
        userDto.setCreatedAt(user.getCreatedAt());
        userDto.setUpdatedAt(user.getUpdatedAt());

        return userDto;
    }


    public UserDto forgotPassword(ChangePasswordRequest changePasswordRequest){
        Long userId = changePasswordRequest.getUserId();
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


        // đẩy vào queue
        pushToQueue(user.getEmail(), "USER_FORGET_PASSWORD", Constants.FORGOT_PASSWORD_QUEUE);

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setUsername(user.getUsername());
        userDto.setEmail(user.getEmail());
        userDto.setCreatedAt(user.getCreatedAt());
        userDto.setUpdatedAt(user.getUpdatedAt());

        return userDto;
    }

    // đẩy vào queue của rabbitmq
    private void pushToQueue(String email, String action, String queue){
        try {
            UserEvent event = new UserEvent();
            event.setEmail(email);
            event.setTimestamp(LocalDateTime.now());
            event.setAction(action);

            rabbitTemplate.convertAndSend(Constants.EXCHANGE, queue, event);
        } catch (Exception e) {
            logger.debug("Failed to send login event: {}. This is not critical.", e.getMessage());
        }
    }

}