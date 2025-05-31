package com.example.choviet.controller.common;
import static com.example.choviet.config.API.Prefix.*;
import static com.example.choviet.config.API.Mid.*;
import static com.example.choviet.config.API.suffix.Verify.*;
import static com.example.choviet.config.Code.*;
import com.example.choviet.dto.ApiResponse;
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
        return ResponseEntity.ok(new ApiResponse<>( OK, "Success", message));
    }

    @PostMapping(VALIDATE_EMAIL_TOKEN)
    public ResponseEntity<ApiResponse<String>> validateEmailToken(@RequestBody VerifyEmailRequest verifyEmail) {
        String emailValid = verifyService.validateEmailToken(verifyEmail);
        return ResponseEntity.ok(new ApiResponse<>( OK, "Success", "Xác thực thành công " + emailValid));
    }
}