package com.example.choviet.service;

import com.example.choviet.dto.*;
import com.example.choviet.entity.Customer;
import com.example.choviet.entity.RefreshToken;
import com.example.choviet.entity.Role;
import com.example.choviet.entity.User;
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
    RefreshTokenService refreshTokenService;
    @Autowired
    RedisService redisService;
    @Autowired
    RabbitMQService eventPublisher;
    final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();


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
                        accessToken = jwtUtil.generateTokenWithRole(user.getEmail(), user.getRole().getRoleName().name());
                    } else {
                        accessToken = jwtUtil.generateToken(user.getEmail());
                    }

                    // Invalidate old refresh token
                    refreshTokenService.invalidateToken(requestRefreshToken);

                    // Create new refresh token
                    RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user.getId());

                    return new TokenRefreshResponse(accessToken, newRefreshToken.getToken());
                })
                .orElseThrow(null);
    }

    @Transactional
    public AuthResponse loginUser(LoginRequest request){
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new IllegalArgumentException("Email and password are required");
        }
        // Tìm kiếm trong cả 2 bảng
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isPresent() && passwordEncoder.matches(request.getPassword(), optionalUser.get().getPassword())) {
            User user = optionalUser.get();
            if(redisService.isKeyExists(user.getId())) throw new RuntimeException("Session logged in, pls logout first");
            if(user.getStatus().equals(User.Status.INACTIVE)) throw new RuntimeException("Not Active");

            // Generate access token
            String accessToken;
            if (user.getRole() != null) {
                accessToken = jwtUtil.generateTokenWithRole(user.getEmail(), user.getRole().getRoleName().name());
            } else {
                accessToken = jwtUtil.generateToken(user.getEmail());
            }

            // Generate refresh token
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

            redisService.set(user.getId(), accessToken, 1, TimeUnit.HOURS);


            // Create response
            AuthResponse response = new AuthResponse();
            response.setEmail(user.getEmail());
            response.setToken(refreshToken.getToken());
            response.setRoleName(user.getRole().getRoleName());
            response.setPermission(user.getRole().getPermissions());
            response.setUserType("USER");
            response.setCreatedAt(LocalDateTime.now());

            Event<AuthResponse> event = new Event<>();
            event.setData(response);
            event.setAction("USER_LOGIN");
            event.setCreatedAt(response.getCreatedAt());
            eventPublisher.pushToQueue(event, USER_EXCHANGE, LOGIN_QUEUE);

            return response;

        }
        throw new RuntimeException("Invalid credentials");
    }

    @Transactional
    public AuthResponse loginCustomer(LoginRequest request){
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new IllegalArgumentException("Email and password are required");
        }

        Optional<Customer> optionalCustomer = customerRepository.findByEmail(request.getEmail());
        if (optionalCustomer.isPresent() && passwordEncoder.matches(request.getPassword(), optionalCustomer.get().getPasswordHash())) {
            Customer customer = optionalCustomer.get();
            if(redisService.isKeyExists(customer.getId())) throw new RuntimeException("Session logged in, pls logout first");
            if(customer.getStatus().equals(Customer.Status.INACTIVE)) throw new RuntimeException("Not Active");

            // Generate access token
            String accessToken = jwtUtil.generateToken(customer.getEmail());

            // Generate refresh token
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(customer.getId());

            redisService.set(customer.getId(), accessToken, 1, TimeUnit.HOURS);

            // đẩy vào queue
            AuthResponse response = new AuthResponse();
            response.setEmail(customer.getEmail());
            response.setToken(refreshToken.getToken());
            response.setUserType("CUSTOMER");
            response.setCreatedAt(LocalDateTime.now());

            Event<AuthResponse> event = new Event<>();
            event.setData(response);
            event.setAction("USER_LOGIN");
            event.setCreatedAt(response.getCreatedAt());

            eventPublisher.pushToQueue(event, USER_EXCHANGE, LOGIN_QUEUE);
            return response;

        }
        throw new RuntimeException("Invalid credentials");
    }


    // đăng ký tài khoản của nhân viên
    @Transactional
    public AuthResponse registerUser(UserRegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));


        // Assign default staff role
        Optional<Role> staffRole = roleRepository.findByRoleName(request.getRole());
        if (staffRole.isPresent()) {
            user.setRole(staffRole.get());
        } else {
            throw new RuntimeException("Default role not found");
        }

        user.setStatus(User.Status.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        // Save user
        User savedUser = userRepository.save(user);

        // Create and return UserDto
        AuthResponse response = new AuthResponse();
        response.setEmail(savedUser.getEmail());

        if (savedUser.getRole() != null) {
            response.setRoleName(savedUser.getRole().getRoleName());
        }

        // đẩy vào queue
        Event<AuthResponse> event = new Event<>();
        event.setData(response);
        event.setAction("USER_REGISTER");
        event.setCreatedAt(user.getCreatedAt());
        eventPublisher.pushToQueue(event, USER_EXCHANGE, REGISTER_QUEUE);

        return response;
    }

    @Transactional
    public AuthResponse registerCustomer(CustomerRegisterRequest request){
        // Check if email already exists
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        // Create new user
        Customer customer = new Customer();
        customer.setEmail(request.getEmail());
        customer.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        customer.setStatus(Customer.Status.INACTIVE);
        customer.setCreatedAt(LocalDateTime.now());
        customer.setUpdateAt(LocalDateTime.now());

        // Save user
        Customer savedCustomer = customerRepository.save(customer);

        // Create and return UserDto
        AuthResponse response = new AuthResponse();
        response.setEmail(savedCustomer.getEmail());

        // đẩy vào queue
        Event<AuthResponse> event = new Event<>();
        event.setData(response);
        event.setAction("USER_REGISTER");
        event.setCreatedAt(customer.getCreatedAt());
        eventPublisher.pushToQueue(event, USER_EXCHANGE, REGISTER_QUEUE);

        return response;
    }

    // đăng xuất tài khoản của nhân viên
    @Transactional
    public void logout(String id) {
        if(!redisService.isKeyExists(id)) throw new RuntimeException("Logged out");

        boolean isUser = userRepository.existsById(id);
        boolean isCustomer = customerRepository.existsById(id);

        String idGot = "";
        String email = "";
        User user = null;
        Customer customer = null;

        if(isUser){
            user = userRepository.findById(id).orElseThrow(
                    () -> new RuntimeException("User not found")
            );
            idGot = user.getId();
            email = user.getEmail();
            refreshTokenService.invalidateAllUserTokens(user);
        }
        else if(isCustomer){
            customer = customerRepository.findById(id).orElseThrow(
                    () -> new RuntimeException("Customer not found")
            );
            idGot = customer.getId();
            email = customer.getEmail();
            refreshTokenService.invalidateAllCustomerTokens(customer);
        }

        redisService.delete(id);

        // đẩy vào queue
        AuthResponse response = new AuthResponse();
        response.setEmail(email);

        Event<AuthResponse> event = new Event<>();
        event.setData(response);
        event.setAction("USER_LOGOUT");
        event.setCreatedAt(LocalDateTime.now());
        eventPublisher.pushToQueue(event, USER_EXCHANGE, LOGOUT_QUEUE);
    }
    @Transactional
    // đổi mật khẩu của nhân viên
    public AuthResponse changePassword(ChangePasswordRequest changePasswordRequest){
        String userId = changePasswordRequest.getUserId();
        String newPassword = changePasswordRequest.getNewPassword();
        String oldPassword = changePasswordRequest.getOldPassword();
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

        AuthResponse response = new AuthResponse();
        response.setEmail(user.getEmail());

        // đẩy vào queue
        Event<AuthResponse> event = new Event<>();
        event.setData(response);
        event.setAction("USER_CHANGE_PASSWORD");
        event.setCreatedAt(LocalDateTime.now());
        eventPublisher.pushToQueue(event, USER_EXCHANGE, CHANGE_PASSWORD_QUEUE);

        return response;
    }

    @Transactional
    // quên mật khẩu của nhân viên
    public AuthResponse forgotPassword(ChangePasswordRequest changePasswordRequest){
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

        AuthResponse response = new AuthResponse();
        response.setEmail(user.getEmail());

        // đẩy vào queue
        Event<AuthResponse> event = new Event<>();
        event.setData(response);
        event.setAction("USER_FORGET_PASSWORD");
        event.setCreatedAt(LocalDateTime.now());
        eventPublisher.pushToQueue(event, USER_EXCHANGE, FORGOT_PASSWORD_QUEUE);

        return response;
    }

    // cập nhật trạng thái của khách hàng
    public AuthResponse updateStatus(String id, String status){
        Customer customer = customerRepository.findById(id).orElseThrow(
                () -> new RuntimeException("User not found")
        );

        Customer.Status newStatus = Customer.Status.valueOf(status);

        customer.setUpdateAt(LocalDateTime.now());
        customer.setStatus(newStatus);

        AuthResponse response = new AuthResponse();
        response.setEmail(customer.getEmail());
        response.setUserType("CUSTOMER");
        response.setCreatedAt(LocalDateTime.now());

        return response;
    }

    // kiểm tra email của khách hàng tồn tại
    public AuthResponse isExistEmail(String email){
        Customer customer = customerRepository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("User not found")
        );

        AuthResponse response = new AuthResponse();
        response.setEmail(customer.getEmail());
        response.setUserType("CUSTOMER");
        response.setCreatedAt(LocalDateTime.now());

        return response;
    }
}
