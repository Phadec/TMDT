package com.example.demo.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import com.example.demo.services.PromoCodeService;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private PromoCodeService promoCodeService;
    
    @Override
    public void run(String... args) {
        // Create sample promotion codes
        promoCodeService.createSamplePromoCodes();
    }
}
