package com.example.demo.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.example.demo.seeders.CategorySeeder;

@Configuration
public class DataSeederConfig {
    
    @Autowired
    private CategorySeeder categorySeeder;
    
    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
            categorySeeder.seed();
        };
    }
}
