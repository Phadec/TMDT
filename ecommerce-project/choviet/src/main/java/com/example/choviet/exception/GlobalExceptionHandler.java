package com.example.choviet.exception;

import com.example.choviet.config.ErrorConfig;
import com.example.choviet.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Global Exception Handler - Xử lý tất cả lỗi trong ứng dụng
 * Tất cả lỗi sẽ được xử lý thống nhất và không làm crash ứng dụng
 * 
 * Note: ErrorConfig, AppException và ExceptionUtils đã được tách riêng
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ==================== EXCEPTION HANDLERS ====================

    /**
     * Xử lý AppException
     */
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Object>> handleAppException(
            AppException ex, HttpServletRequest request) {
        
        String traceId = generateTraceId();
        log.warn("AppException [{}]: {} - Path: {}", traceId, ex.getMessage(), request.getRequestURI());
        
        Map<String, Object> errorData = createErrorData(ex.getCode(), ex.getMessage(), 
                request.getRequestURI(), ex.getFieldErrors(), traceId);

        ApiResponse<Object> response = new ApiResponse<>(ex.getCode(), ex.getMessage(), errorData);
        return new ResponseEntity<>(response, ex.getHttpStatus());
    }

    /**
     * Xử lý Spring Validation errors (@Valid)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        
        String traceId = generateTraceId();
        Map<String, String> fieldErrors = new HashMap<>();
        
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });

        log.warn("Validation Error [{}]: Field validation failed - Path: {}", traceId, request.getRequestURI());
        
        Map<String, Object> errorData = createErrorData(ErrorConfig.INVALID_DATA, 
                "Dữ liệu không hợp lệ", request.getRequestURI(), fieldErrors, traceId);

        ApiResponse<Object> response = new ApiResponse<>(ErrorConfig.INVALID_DATA, "Dữ liệu không hợp lệ", errorData);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Xử lý BindException
     */
    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiResponse<Object>> handleBindException(
            BindException ex, HttpServletRequest request) {
        
        String traceId = generateTraceId();
        Map<String, String> fieldErrors = new HashMap<>();
        
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });

        log.warn("Bind Error [{}]: Binding failed - Path: {}", traceId, request.getRequestURI());
        
        Map<String, Object> errorData = createErrorData(ErrorConfig.INVALID_DATA, 
                "Dữ liệu binding không hợp lệ", request.getRequestURI(), fieldErrors, traceId);

        ApiResponse<Object> response = new ApiResponse<>(ErrorConfig.INVALID_DATA, "Dữ liệu binding không hợp lệ", errorData);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Xử lý HTTP Method Not Supported
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        
        String traceId = generateTraceId();
        log.warn("Method Not Supported [{}]: {} - Path: {}", traceId, ex.getMessage(), request.getRequestURI());
        
        Map<String, Object> errorData = createErrorData(ErrorConfig.METHOD_NOT_ALLOWED, 
                "Phương thức HTTP không được hỗ trợ: " + ex.getMethod(), 
                request.getRequestURI(), null, traceId);

        ApiResponse<Object> response = new ApiResponse<>(ErrorConfig.METHOD_NOT_ALLOWED, 
                "Phương thức HTTP không được hỗ trợ", errorData);
        
        return new ResponseEntity<>(response, HttpStatus.METHOD_NOT_ALLOWED);
    }

    /**
     * Xử lý Missing Request Parameter
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Object>> handleMissingParameter(
            MissingServletRequestParameterException ex, HttpServletRequest request) {
        
        String traceId = generateTraceId();
        log.warn("Missing Parameter [{}]: {} - Path: {}", traceId, ex.getMessage(), request.getRequestURI());
        
        Map<String, Object> errorData = createErrorData(ErrorConfig.BAD_REQUEST, 
                "Thiếu tham số bắt buộc: " + ex.getParameterName(), 
                request.getRequestURI(), null, traceId);

        ApiResponse<Object> response = new ApiResponse<>(ErrorConfig.BAD_REQUEST, 
                "Thiếu tham số bắt buộc", errorData);
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Xử lý Method Argument Type Mismatch
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Object>> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        
        String traceId = generateTraceId();
        log.warn("Type Mismatch [{}]: {} - Path: {}", traceId, ex.getMessage(), request.getRequestURI());
        
        Map<String, Object> errorData = createErrorData(ErrorConfig.BAD_REQUEST, 
                String.format("Kiểu dữ liệu không hợp lệ cho tham số '%s'", ex.getName()), 
                request.getRequestURI(), null, traceId);

        ApiResponse<Object> response = new ApiResponse<>(ErrorConfig.BAD_REQUEST, 
                "Kiểu dữ liệu không hợp lệ", errorData);
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Xử lý HTTP Message Not Readable (JSON parsing error)
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Object>> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, HttpServletRequest request) {
        
        String traceId = generateTraceId();
        log.warn("Message Not Readable [{}]: {} - Path: {}", traceId, ex.getMessage(), request.getRequestURI());
        
        Map<String, Object> errorData = createErrorData(ErrorConfig.BAD_REQUEST, 
                "Định dạng JSON không hợp lệ", 
                request.getRequestURI(), null, traceId);

        ApiResponse<Object> response = new ApiResponse<>(ErrorConfig.BAD_REQUEST, 
                "Định dạng JSON không hợp lệ", errorData);
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Xử lý 404 Not Found
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleNotFound(
            NoHandlerFoundException ex, HttpServletRequest request) {
        
        String traceId = generateTraceId();
        log.warn("Not Found [{}]: {} - Path: {}", traceId, ex.getMessage(), request.getRequestURI());
        
        Map<String, Object> errorData = createErrorData(ErrorConfig.NOT_FOUND, 
                "Không tìm thấy endpoint: " + ex.getRequestURL(), 
                request.getRequestURI(), null, traceId);

        ApiResponse<Object> response = new ApiResponse<>(ErrorConfig.NOT_FOUND, 
                "Không tìm thấy endpoint", errorData);
        
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    /**
     * Xử lý tất cả các exception khác (fallback)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(
            Exception ex, HttpServletRequest request) {
        
        String traceId = generateTraceId();
        log.error("Unexpected Error [{}]: {} - Path: {}", traceId, ex.getMessage(), request.getRequestURI(), ex);
        
        Map<String, Object> errorData = createErrorData(ErrorConfig.INTERNAL_SERVER_ERROR, 
                "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.", 
                request.getRequestURI(), null, traceId);

        ApiResponse<Object> response = new ApiResponse<>(ErrorConfig.INTERNAL_SERVER_ERROR, 
                "Lỗi hệ thống", errorData);
        
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Tạo error data object
     */
    private Map<String, Object> createErrorData(int code, String message, String path, 
                                               Map<String, String> fieldErrors, String traceId) {
        Map<String, Object> errorData = new HashMap<>();
        errorData.put("code", code);
        errorData.put("message", message);
        errorData.put("path", path);
        errorData.put("timestamp", LocalDateTime.now());
        errorData.put("traceId", traceId);
        
        if (fieldErrors != null && !fieldErrors.isEmpty()) {
            errorData.put("fieldErrors", fieldErrors);
        }
        
        return errorData;
    }

    /**
     * Generate unique trace ID for error tracking
     */
    private String generateTraceId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}