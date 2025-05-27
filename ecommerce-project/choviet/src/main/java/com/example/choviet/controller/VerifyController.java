package com.example.choviet.controller;
import com.example.choviet.dto.VerifyEmailRequest;
import com.example.choviet.service.VerifyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/verify")
public class VerifyController {

    @Autowired
    private VerifyService verifyService;


    @PostMapping("/send")
    public void sendVerificationEmail(@RequestBody VerifyEmailRequest verifyEmail) {
        verifyService.sendVerificationEmail(verifyEmail.getEmail());
    }


    @PostMapping("/confirm")
    public boolean validateEmailToken(@RequestBody VerifyEmailRequest verifyEmail) {
        return verifyService.validateEmailToken(verifyEmail);
    }
}