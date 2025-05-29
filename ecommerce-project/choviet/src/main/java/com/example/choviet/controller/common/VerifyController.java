package com.example.choviet.controller.common;
import static com.example.choviet.config.Code.*;
import com.example.choviet.dto.ApiResponse;
import com.example.choviet.dto.VerifyEmailRequest;
import com.example.choviet.service.VerifyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/common/verify")
public class VerifyController {
    @Autowired
    private VerifyService verifyService;

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<String>> sendVerificationEmail(@RequestBody VerifyEmailRequest verifyEmail) {
        String message = verifyService.sendVerificationEmail(verifyEmail.getEmail());
        return ResponseEntity.ok(new ApiResponse<>( OK, "Success", message));
    }

    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<String>> validateEmailToken(@RequestBody VerifyEmailRequest verifyEmail) {
        String emailValid = verifyService.validateEmailToken(verifyEmail);
        return ResponseEntity.ok(new ApiResponse<>( OK, "Success", "Xác thực thành công " + emailValid));
    }
}