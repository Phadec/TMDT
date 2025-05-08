package com.example.user_service.controller;

import com.example.user_service.dto.*;
import com.example.user_service.service.UserService;
import com.example.user_service.service.VerifyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class VerifyController {

    @Autowired
    private VerifyService verifyService;


    @PostMapping("/verify/send")
    public void sendVerificationEmail(@RequestBody VerifyEmailRequest verifyEmail) {
        verifyService.sendVerificationEmail(verifyEmail.getEmail());
    }


    @PostMapping("/verify")
    public boolean validateEmailToken(@RequestBody VerifyEmailRequest verifyEmail) {
        return verifyService.validateEmailToken(verifyEmail);
    }
}