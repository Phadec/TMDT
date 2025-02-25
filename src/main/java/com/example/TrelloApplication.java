package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@EnableMongoAuditing
@ComponentScan(basePackages = "com.example.trello")
public class TrelloApplication {
    public static void main(String[] args) {
        SpringApplication.run(TrelloApplication.class, args);
    }
}
