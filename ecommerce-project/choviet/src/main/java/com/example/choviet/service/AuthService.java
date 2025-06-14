package com.example.choviet.service;

import com.example.choviet.config.ErrorConfig;
import com.example.choviet.dto.*;
import com.example.choviet.entity.Customer;
import com.example.choviet.entity.Role;
import com.example.choviet.entity.User;
import com.example.choviet.exception.AppException;
import com.example.choviet.repository.CustomerRepository;
import com.example.choviet.repository.RoleRepository;
import com.example.choviet.repository.UserRepository;
import com.example.choviet.utils.JwtUtil;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static com.example.choviet.config.ConfigTopicUser.*;
import static com.example.choviet.config.envent.EventNameConfig.*;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Service
public class AuthService {
    @Autowired
    UserRepository userRepository;
    @Autowired
    CustomerRepository customerRepository;

    @Autowired
    RoleRepository roleRepository;
    @Autowired
    JwtUtil jwtUtil;

    @Autowired
    RedisService redisService;
    @Autowired
    RabbitMQService eventPublisher;
    final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public AuthResponse loginUser(LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new AppException(ErrorConfig.INVALID_DATA, "Email và mật khẩu không được để trống");
        }
        // Tìm kiếm trong cả 2 bảng
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isPresent()
                && passwordEncoder.matches(request.getPassword(), optionalUser.get().getPassword())) {
            User user = optionalUser.get();
            // Đã lưu kiểm tra trên redis
            if (redisService.isKeyExists(user.getId()))
                throw new AppException(ErrorConfig.BUSINESS_RULE_VIOLATION, "Phiên đăng nhập đã tồn tại, vui lòng đăng xuất trước");

            // Tài khoản này bị ban
            if (user.getStatus().equals(User.Status.INACTIVE))
                throw new AppException(ErrorConfig.ACCESS_DENIED, "Tài khoản đã bị vô hiệu hóa");

            // Generate access token
            String accessToken = jwtUtil.generateTokenWithRole(user.getId(), user.getRole().getRoleName().name());

            redisService.set(user.getId(), accessToken, 1, TimeUnit.HOURS);

            // Create response
            AuthResponse response = new AuthResponse();
            response.setId(user.getId());
            response.setToken(accessToken);
            response.setRoleName(user.getRole().getRoleName());
            response.setPermission(user.getRole().getPermissions());
            response.setUserType("USER");
            response.setCreatedAt(LocalDateTime.now());

            Event<AuthResponse> event = new Event<>();
            event.setData(response);
            event.setAction(USER_LOGIN);
            event.setCreatedAt(response.getCreatedAt());
            eventPublisher.pushToQueue(event, USER_EXCHANGE, LOGIN_QUEUE);

            return response;

        }
        throw new AppException(ErrorConfig.INVALID_CREDENTIALS);
    }

    @Transactional
    public AuthResponse loginCustomer(LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new AppException(ErrorConfig.INVALID_DATA, "Email và mật khẩu không được để trống");
        }

        Optional<Customer> optionalCustomer = customerRepository.findByEmail(request.getEmail());
        if (optionalCustomer.isPresent()
                && passwordEncoder.matches(request.getPassword(), optionalCustomer.get().getPasswordHash())) {
            Customer customer = optionalCustomer.get();
            if (redisService.isKeyExists(customer.getId()))
                throw new AppException(ErrorConfig.BUSINESS_RULE_VIOLATION, "Phiên đăng nhập đã tồn tại, vui lòng đăng xuất trước");
            // Removed account activation check since all accounts are now active by default

            // Generate access token
            String accessToken = jwtUtil.generateToken(customer.getId());

            redisService.set(customer.getId(), accessToken, 1, TimeUnit.HOURS);

            // đẩy vào queue
            AuthResponse response = new AuthResponse();
            response.setId(customer.getId());
            response.setToken(accessToken);
            response.setUserType("CUSTOMER");
            response.setCreatedAt(LocalDateTime.now());

            Event<AuthResponse> event = new Event<>();
            event.setData(response);
            event.setAction(USER_LOGIN);
            event.setCreatedAt(response.getCreatedAt());

            eventPublisher.pushToQueue(event, USER_EXCHANGE, LOGIN_QUEUE);
            return response;

        }
        throw new AppException(ErrorConfig.INVALID_CREDENTIALS);
    }

    // đăng ký tài khoản của nhân viên
    @Transactional
    public AuthResponse registerUser(UserRegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorConfig.EMAIL_ALREADY_EXISTS);
        }

        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Assign role - nếu không có role thì mặc định là STAFF
        Role.RoleName roleName = request.getRole() != null ? request.getRole() : Role.RoleName.STAFF;
        Optional<Role> roleOptional = roleRepository.findByRoleName(roleName);

        System.out.println("Assigned role: " + roleName);
        if (roleOptional.isPresent()) {
            user.setRole(roleOptional.get());
        } else {
            throw new AppException(ErrorConfig.NOT_FOUND, "Không tìm thấy vai trò: " + roleName);
        }

        user.setStatus(User.Status.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        // Save user
        User savedUser = userRepository.save(user);

        // Create and return UserDto
        AuthResponse response = new AuthResponse();
        response.setId(savedUser.getId());

        if (savedUser.getRole() != null) {
            response.setRoleName(savedUser.getRole().getRoleName());
        }

        // đẩy vào queue
        Event<AuthResponse> event = new Event<>();
        event.setData(response);
        event.setAction(USER_REGISTER);
        event.setCreatedAt(user.getCreatedAt());
        eventPublisher.pushToQueue(event, USER_EXCHANGE, REGISTER_QUEUE);

        return response;
    }

    @Autowired
    EmailService emailService;

    @Transactional
    public AuthResponse registerCustomer(CustomerRegisterRequest request) {
        // Validate required fields
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new AppException(ErrorConfig.INVALID_DATA, "Email không được để trống");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new AppException(ErrorConfig.INVALID_DATA, "Mật khẩu không được để trống");
        }
        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            throw new AppException(ErrorConfig.INVALID_DATA, "Họ tên không được để trống");
        }

        // Check if email already exists
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorConfig.EMAIL_ALREADY_EXISTS);
        }

        // Create new customer
        Customer customer = new Customer();
        customer.setEmail(request.getEmail());
        customer.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        customer.setFullName(request.getFullName());
        customer.setPhone(request.getPhone());
        customer.setAddresses(request.getAddresses());
        customer.setSeller(request.isSeller());
        customer.setStatus(Customer.Status.ACTIVE); // Set status to ACTIVE by default (removed activation requirement)
        customer.setCreatedAt(LocalDateTime.now());
        customer.setUpdateAt(LocalDateTime.now());

        // Save user
        Customer savedCustomer = customerRepository.save(customer);

        // Create and return UserDto
        AuthResponse response = new AuthResponse();
        response.setEmail(savedCustomer.getEmail());
        response.setFullname(savedCustomer.getFullName());

        // đẩy vào queue để gửi email
        Event<AuthResponse> event = new Event<>();
        event.setData(response);
        event.setAction(USER_REGISTER);
        event.setCreatedAt(customer.getCreatedAt());
        eventPublisher.pushToQueue(event, USER_EXCHANGE, REGISTER_QUEUE);

        return response;
    }

    // đăng xuất tài khoản của nhân viên và khách hàng
    @Transactional
    public void logout(PersonRequest request) {
        String id = request.getPersonId();
        System.out.println("user id: " + id);
        if (!redisService.isKeyExists(id))
            throw new AppException(ErrorConfig.BUSINESS_RULE_VIOLATION, "Người dùng đã đăng xuất");

        // Get current token from Redis to add to blacklist
        String token = (String) redisService.get(id);

        // Add token to blacklist with remaining expiration time
        if (token != null) {
            try {
                long remainingTime = jwtUtil.extractExpiration(token).getTime() - System.currentTimeMillis();
                if (remainingTime > 0) {
                    redisService.set("blacklist:" + token, "true", (int) (remainingTime / 1000),
                            TimeUnit.SECONDS);
                }
            } catch (Exception e) {
                // Token might be invalid, but we still proceed with logout
            }
        }

        redisService.delete(id);

        // đẩy vào queue
        AuthResponse response = new AuthResponse();
        response.setId(id);

        Event<AuthResponse> event = new Event<>();
        event.setData(response);
        event.setAction(USER_LOGOUT);
        event.setCreatedAt(LocalDateTime.now());
        eventPublisher.pushToQueue(event, USER_EXCHANGE, LOGOUT_QUEUE);
    }

    @Transactional
    // đổi mật khẩu của nhân viên
    public AuthResponse changePassword(ChangePasswordRequest changePasswordRequest) {
        String userId = changePasswordRequest.getUserId();
        String newPassword = changePasswordRequest.getNewPassword();
        String oldPassword = changePasswordRequest.getOldPassword();
        String againNewPassword = changePasswordRequest.getReNewPassword();
        String email = changePasswordRequest.getEmail();

        if (!newPassword.equals(againNewPassword)) {
            throw new AppException(ErrorConfig.INVALID_DATA, "Mật khẩu mới không khớp với xác nhận mật khẩu");
        } else if (newPassword.equals(oldPassword)) {
            throw new AppException(ErrorConfig.INVALID_DATA, "Mật khẩu mới không được trùng với mật khẩu cũ");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorConfig.USER_NOT_FOUND));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new AppException(ErrorConfig.INVALID_CREDENTIALS, "Mật khẩu cũ không chính xác");
        }

        if (!user.getEmail().equals(email)) {
            throw new AppException(ErrorConfig.INVALID_DATA, "Email không chính xác");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        AuthResponse response = new AuthResponse();
        response.setId(user.getId());

        // đẩy vào queue
        Event<AuthResponse> event = new Event<>();
        event.setData(response);
        event.setAction(USER_CHANGE_PASSWORD);
        event.setCreatedAt(LocalDateTime.now());
        eventPublisher.pushToQueue(event, USER_EXCHANGE, CHANGE_PASSWORD_QUEUE);

        return response;
    }

    @Transactional
    // quên mật khẩu của nhân viên
    public AuthResponse forgotPassword(ChangePasswordRequest changePasswordRequest) {
        String userId = changePasswordRequest.getUserId();
        String newPassword = changePasswordRequest.getNewPassword();
        String againNewPassword = changePasswordRequest.getReNewPassword();
        String email = changePasswordRequest.getEmail();

        if (!newPassword.equals(againNewPassword)) {
            throw new AppException(ErrorConfig.INVALID_DATA, "Mật khẩu mới không khớp với xác nhận mật khẩu");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorConfig.USER_NOT_FOUND));

        if (!user.getEmail().equals(email)) {
            throw new AppException(ErrorConfig.INVALID_DATA, "Email không chính xác");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        AuthResponse response = new AuthResponse();
        response.setId(user.getId());

        // đẩy vào queue
        Event<AuthResponse> event = new Event<>();
        event.setData(response);
        event.setAction(USER_FORGET_PASSWORD);
        event.setCreatedAt(LocalDateTime.now());
        eventPublisher.pushToQueue(event, USER_EXCHANGE, FORGOT_PASSWORD_QUEUE);

        return response;
    }

    // cập nhật trạng thái của khách hàng
    public AuthResponse updateStatus(String id, String status) {
        Customer customer = customerRepository.findById(id).orElseThrow(
                () -> new AppException(ErrorConfig.CUSTOMER_NOT_FOUND));

        Customer.Status newStatus = Customer.Status.valueOf(status);

        customer.setUpdateAt(LocalDateTime.now());
        customer.setStatus(newStatus);
        customerRepository.save(customer);

        AuthResponse response = new AuthResponse();
        response.setId(customer.getId());
        response.setUserType("CUSTOMER");
        response.setCreatedAt(LocalDateTime.now());

        // Đẩy event cập nhật trạng thái vào queue
        Event<AuthResponse> event = new Event<>();
        event.setData(response);
        event.setAction(USER_UPDATE_STATUS);
        event.setCreatedAt(LocalDateTime.now());
        eventPublisher.pushToQueue(event, USER_EXCHANGE, REGISTER_QUEUE);

        return response;
    }

    // kiểm tra email của khách hàng tồn tại
    public AuthResponse isExistEmail(String email) {
        Customer customer = customerRepository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("User not found"));

        AuthResponse response = new AuthResponse();
        response.setId(customer.getId());
        response.setUserType("CUSTOMER");
        response.setCreatedAt(LocalDateTime.now());

        return response;
    }

    public AuthResponse validateTokenUser(String token) {
        return jwtUtil.validateTokenUser(token);
    }

    public AuthResponse validateTokenCustomer(String token) {
        return jwtUtil.validateTokenCustomer(token);
    }
}
