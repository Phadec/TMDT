package com.example.choviet.controller.common;
import static com.example.choviet.config.Code.*;
import static com.example.choviet.config.api.Mid.*;
import static com.example.choviet.config.api.Prefix.*;
import static com.example.choviet.config.api.suffix.Verify.*;

import com.example.choviet.dto.ApiResponse;
import com.example.choviet.dto.EmailRequest;
import com.example.choviet.dto.VerifyEmailRequest;
import com.example.choviet.service.VerifyService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping(COMMON + VERIFY)
public class VerifyController {
    @Autowired
    VerifyService verifyService;

    @PostMapping(SEND_VERIFICATION_EMAIL)
    public ResponseEntity<ApiResponse<String>> sendVerificationEmail(@RequestBody VerifyEmailRequest verifyEmail) {
        String message = verifyService.sendVerificationEmail(verifyEmail.getEmail());
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", message));
    }

    @PostMapping(SEND_EMAIL)
    public ResponseEntity<ApiResponse<String>> sendEmail(@RequestBody EmailRequest emailRequest) {
        String message = verifyService.sendEmail(emailRequest);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", message));
    }

    @PostMapping(VALIDATE_EMAIL_TOKEN)
    public ResponseEntity<ApiResponse<String>> validateEmailToken(@RequestBody VerifyEmailRequest verifyEmail) {
        String emailValid = verifyService.validateEmailToken(verifyEmail);
        return ResponseEntity.ok(new ApiResponse<>( OK, "success", "Xác thực thành công " + emailValid));
    }
}