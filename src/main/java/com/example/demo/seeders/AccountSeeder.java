package com.example.demo.seeders;

import com.example.demo.models.User;
import com.example.demo.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class AccountSeeder {
    @Autowired
    UserRepository userRepository;

    public void seed() {
        if (userRepository.count() == 0) {
            // Seed accounts
            User admin = createAccount("Admin", "pro", "admin", "admin@gmail.com", "0123456789", "admin", "ADMIN");
            User u1 = createAccount("User", "no1", "user", "user@gmail.com", "0123456788", "user", "USER");
        }
    }

    private User createAccount(String firstName, String lastName, String username, String email, String phoneNumber, String password, String role) {
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setUsername(username);
        user.setEmail(email);
        user.setPhoneNumber(phoneNumber);
        user.setPassword(password);
        user.setRole(role);
        user.setEmailVerified(true);
        return userRepository.save(user);
    }

}
