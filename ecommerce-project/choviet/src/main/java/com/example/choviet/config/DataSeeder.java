package com.example.choviet.config;

import com.example.choviet.entity.Role;
import com.example.choviet.entity.User;
import com.example.choviet.repository.RoleRepository;
import com.example.choviet.repository.UserRepository;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class DataSeeder implements CommandLineRunner {

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("🚀 Checking and seeding essential data...");
        
        try {
            // Seed roles nếu chưa có
            seedRolesIfNeeded();
            
            // Seed admin users nếu chưa có
            seedAdminUsersIfNeeded();
            
            log.info("✅ Data seeding completed successfully!");
            
        } catch (Exception e) {
            log.error("❌ Data seeding failed: {}", e.getMessage(), e);
        }
    }

    private void seedRolesIfNeeded() {
        log.info("🔍 Checking roles...");
        
        // Kiểm tra và tạo từng role
        createRoleIfNotExists(Role.RoleName.SUPER_ADMIN, Role.PermissionScope.ALL, 
            "Super Administrator với quyền truy cập toàn hệ thống", new String[]{"*"});
            
        createRoleIfNotExists(Role.RoleName.ADMIN, Role.PermissionScope.ALL,
            "Administrator với quyền quản lý hệ thống", 
            new String[]{"user.read", "user.write", "user.delete", "product.read", "product.write", 
                        "product.delete", "order.read", "order.write", "order.delete", 
                        "customer.read", "customer.write", "customer.delete"});
                        
        createRoleIfNotExists(Role.RoleName.STAFF, Role.PermissionScope.CUSTOM,
            "Nhân viên", 
            new String[]{"product.read", "order.read", "customer.read"});
                        
        createRoleIfNotExists(Role.RoleName.STAFF_MANAGEMENT, Role.PermissionScope.CUSTOM,
            "Nhân viên quản lý", 
            new String[]{"product.read", "product.write", "order.read", "order.write", "customer.read"});
            
        createRoleIfNotExists(Role.RoleName.STAFF_CHAT, Role.PermissionScope.CUSTOM,
            "Nhân viên hỗ trợ chat", 
            new String[]{"chat.read", "chat.write", "customer.read", "order.read"});
            
        createRoleIfNotExists(Role.RoleName.STAFF_NEWS, Role.PermissionScope.CUSTOM,
            "Nhân viên quản lý tin tức", 
            new String[]{"news.read ", "news.write", "news.delete"});
    }

    private void seedAdminUsersIfNeeded() {
        log.info("🔍 Checking admin users...");
        
        // Kiểm tra xem có SUPER_ADMIN nào chưa
        if (!hasSuperAdmin()) {
            createAdminUser("superadmin@choviet.com", "SuperAdmin@123", Role.RoleName.SUPER_ADMIN);
        } else {
            log.info("→ SUPER_ADMIN user already exists");
        }
        
        // Kiểm tra xem có ADMIN nào chưa
        if (!userRepository.existsByEmail("admin@choviet.com")) {
            createAdminUser("admin@choviet.com", "Admin@123", Role.RoleName.ADMIN);
        } else {
            log.info("→ Admin user already exists");
        }
    }

    private void createRoleIfNotExists(Role.RoleName roleName, Role.PermissionScope scope, 
                                     String description, String[] permissions) {
        Optional<Role> existingRole = roleRepository.findByRoleName(roleName);
        
        if (existingRole.isEmpty()) {
            Role role = new Role();
            role.setRoleName(roleName);
            role.setPermissionScope(scope);
            role.setDescription(description);
            role.setPermissions(permissions);
            
            roleRepository.save(role);
            log.info("✅ Created role: {}", roleName);
        }
    }

    private void createAdminUser(String email, String password, Role.RoleName roleName) {
        // Lấy role
        Optional<Role> roleOpt = roleRepository.findByRoleName(roleName);
        if (roleOpt.isEmpty()) {
            log.error("❌ Role not found: {}", roleName);
            return;
        }

        // Tạo user
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(roleOpt.get());
        user.setStatus(User.Status.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
        log.info("✅ Created user: {} with role: {}", email, roleName);
    }

    private boolean hasSuperAdmin() {
        Optional<Role> superAdminRole = roleRepository.findByRoleName(Role.RoleName.SUPER_ADMIN);
        if (superAdminRole.isEmpty()) {
            return false;
        }

        List<User> allUsers = userRepository.findAll();
        return allUsers.stream()
            .anyMatch(user -> user.getRole() != null && 
                     user.getRole().getRoleName() == Role.RoleName.SUPER_ADMIN);
    }
}