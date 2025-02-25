package com.example.demo.exceptions;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<?> handleBadRequestException(BadRequestException ex) {
        logger.error("Bad request error: {}", ex.getMessage());
        return ResponseEntity.badRequest()
            .body(Map.of(
                "error", "Bad Request",
                "message", ex.getMessage()
            ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception ex) {
        logger.error("Unexpected error: {}", ex.getMessage());
        return ResponseEntity.internalServerError()
            .body(Map.of(
                "error", "Internal Server Error",
                "message", "An unexpected error occurred"
            ));
    }
}
