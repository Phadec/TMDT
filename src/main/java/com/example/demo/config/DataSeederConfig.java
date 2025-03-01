package com.example.demo.config;

import com.example.demo.seeders.AccountSeeder;
import com.example.demo.seeders.ProductSeeder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.example.demo.seeders.CategorySeeder;

@Configuration
public class DataSeederConfig {
    
    @Autowired
    private CategorySeeder categorySeeder;
    @Autowired
    AccountSeeder accountSeeder;
    @Autowired
    ProductSeeder productSeeder;
    
    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
            categorySeeder.seed();
            accountSeeder.seed();
            productSeeder.seed();
        };
    }
}
