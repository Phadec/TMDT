package com.example.choviet.exception;

import com.example.choviet.config.ErrorConfig;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;

/**
 * Custom Application Exception
 * Exception chính của ứng dụng để throw trong business logic
 */
public class AppException extends RuntimeException {
    
    private final int code;
    private final HttpStatus httpStatus;
    private final Map<String, String> fieldErrors;

    /**
     * Constructor với error code
     * @param code Error code từ ErrorConfig
     */
    public AppException(int code) {
        super(ErrorConfig.getMessage(code));
        this.code = code;
        this.httpStatus = getHttpStatusFromCode(code);
        this.fieldErrors = new HashMap<>();
    }

    /**
     * Constructor với error code và custom message
     * @param code Error code từ ErrorConfig
     * @param message Custom error message
     */
    public AppException(int code, String message) {
        super(message);
        this.code = code;
        this.httpStatus = getHttpStatusFromCode(code);
        this.fieldErrors = new HashMap<>();
    }

    /**
     * Constructor với error code, message và field errors
     * @param code Error code từ ErrorConfig
     * @param message Custom error message
     * @param fieldErrors Map chứa field validation errors
     */
    public AppException(int code, String message, Map<String, String> fieldErrors) {
        super(message);
        this.code = code;
        this.httpStatus = getHttpStatusFromCode(code);
        this.fieldErrors = fieldErrors != null ? fieldErrors : new HashMap<>();
    }

    /**
     * Mapping error code thành HTTP status
     * @param code Error code
     * @return HttpStatus tương ứng
     */
    private HttpStatus getHttpStatusFromCode(int code) {
        // Business errors (1001-1999) mặc định là BAD_REQUEST
        if (ErrorConfig.isBusinessError(code)) {
            return HttpStatus.BAD_REQUEST;
        }
        
        // Mapping specific codes
        switch (code) {
            case 401: 
            case ErrorConfig.TOKEN_EXPIRED: 
            case ErrorConfig.INVALID_CREDENTIALS:
                return HttpStatus.UNAUTHORIZED;
                
            case 403: 
            case ErrorConfig.ACCESS_DENIED:
                return HttpStatus.FORBIDDEN;
                
            case 404: 
            case ErrorConfig.USER_NOT_FOUND: 
            case ErrorConfig.PRODUCT_NOT_FOUND: 
            case ErrorConfig.ORDER_NOT_FOUND: 
            case ErrorConfig.CUSTOMER_NOT_FOUND:
                return HttpStatus.NOT_FOUND;
                
            case 500:
                return HttpStatus.INTERNAL_SERVER_ERROR;
                
            default:
                return HttpStatus.BAD_REQUEST;
        }
    }

    // ==================== GETTERS ====================
    
    public int getCode() { 
        return code; 
    }
    
    public HttpStatus getHttpStatus() { 
        return httpStatus; 
    }
    
    public Map<String, String> getFieldErrors() { 
        return fieldErrors; 
    }
    
    /**
     * Kiểm tra xem exception có field errors không
     * @return true nếu có field errors
     */
    public boolean hasFieldErrors() {
        return fieldErrors != null && !fieldErrors.isEmpty();
    }
    
    /**
     * Thêm field error
     * @param field Field name
     * @param error Error message
     */
    public void addFieldError(String field, String error) {
        if (fieldErrors != null) {
            fieldErrors.put(field, error);
        }
    }
    
    @Override
    public String toString() {
        return String.format("AppException{code=%d, message='%s', httpStatus=%s, fieldErrors=%s}", 
                code, getMessage(), httpStatus, fieldErrors);
    }
}