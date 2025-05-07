package com.example.user_service;

import com.example.user_service.entity.Role;
import com.example.user_service.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;

import java.util.Optional;

@SpringBootApplication
@EnableDiscoveryClient
public class UserServiceApplication {
	public static void main(String[] args) {
		SpringApplication.run(UserServiceApplication.class, args);
	}
	
	@Bean
	public CommandLineRunner initDatabase(RoleRepository roleRepository) {
		return args -> {
			// Create ADMIN role if it doesn't exist
			Optional<Role> adminRole = roleRepository.findByRoleName("ADMIN");
			if (adminRole.isEmpty()) {
				Role role = new Role();
				role.setRoleName("ADMIN");
				role.setPermissionScope(Role.PermissionScope.ALL);
				role.setDescription("System administrator with full access");
				roleRepository.save(role);
				System.out.println("Created ADMIN role");
			}
			
			// Create STAFF role if it doesn't exist
			Optional<Role> staffRole = roleRepository.findByRoleName("STAFF");
			if (staffRole.isEmpty()) {
				Role role = new Role();
				role.setRoleName("STAFF");
				role.setPermissionScope(Role.PermissionScope.CUSTOM);
				role.setDescription("Staff member with limited access");
				role.setPermissions(new String[]{"VIEW_PRODUCTS", "EDIT_PRODUCTS", "VIEW_ORDERS"});
				roleRepository.save(role);
				System.out.println("Created STAFF role");
			}
		};
	}
}