package com.example.choviet.utils;

import com.example.choviet.config.ErrorConfig;
import com.example.choviet.exception.AppException;

import java.util.Map;

/**
 * Exception Utility Methods
 * Chứa các utility methods để throw exceptions một cách tiện lợi
 */
public class ExceptionUtils {

    /**
     * Throw exception với error code
     * @param code Error code từ ErrorConfig
     * @throws AppException
     */
    public static void throwError(int code) {
        throw new AppException(code);
    }

    /**
     * Throw exception với error code và message tùy chỉnh
     * @param code Error code từ ErrorConfig
     * @param message Custom error message
     * @throws AppException
     */
    public static void throwError(int code, String message) {
        throw new AppException(code, message);
    }

    /**
     * Throw validation exception với field errors
     * @param message Error message
     * @param fieldErrors Map chứa field validation errors
     * @throws AppException
     */
    public static void throwValidationError(String message, Map<String, String> fieldErrors) {
        throw new AppException(ErrorConfig.INVALID_DATA, message, fieldErrors);
    }

    /**
     * Throw exception nếu condition = true
     * @param condition Điều kiện để throw exception
     * @param code Error code từ ErrorConfig
     * @throws AppException nếu condition = true
     */
    public static void throwIf(boolean condition, int code) {
        if (condition) {
            throw new AppException(code);
        }
    }

    /**
     * Throw exception nếu condition = true với message tùy chỉnh
     * @param condition Điều kiện để throw exception
     * @param code Error code từ ErrorConfig
     * @param message Custom error message
     * @throws AppException nếu condition = true
     */
    public static void throwIf(boolean condition, int code, String message) {
        if (condition) {
            throw new AppException(code, message);
        }
    }

    /**
     * Require non-null, throw exception nếu object = null
     * @param object Object cần kiểm tra
     * @param code Error code từ ErrorConfig
     * @param <T> Type của object
     * @return object nếu không null
     * @throws AppException nếu object = null
     */
    public static <T> T requireNonNull(T object, int code) {
        if (object == null) {
            throw new AppException(code);
        }
        return object;
    }

    /**
     * Require non-null với message tùy chỉnh
     * @param object Object cần kiểm tra
     * @param code Error code từ ErrorConfig
     * @param message Custom error message
     * @param <T> Type của object
     * @return object nếu không null
     * @throws AppException nếu object = null
     */
    public static <T> T requireNonNull(T object, int code, String message) {
        if (object == null) {
            throw new AppException(code, message);
        }
        return object;
    }

    /**
     * Require true, throw exception nếu condition = false
     * @param condition Điều kiện phải đúng
     * @param code Error code từ ErrorConfig
     * @throws AppException nếu condition = false
     */
    public static void requireTrue(boolean condition, int code) {
        if (!condition) {
            throw new AppException(code);
        }
    }

    /**
     * Require true với message tùy chỉnh
     * @param condition Điều kiện phải đúng
     * @param code Error code từ ErrorConfig
     * @param message Custom error message
     * @throws AppException nếu condition = false
     */
    public static void requireTrue(boolean condition, int code, String message) {
        if (!condition) {
            throw new AppException(code, message);
        }
    }

    /**
     * Require false, throw exception nếu condition = true
     * @param condition Điều kiện phải sai
     * @param code Error code từ ErrorConfig
     * @throws AppException nếu condition = true
     */
    public static void requireFalse(boolean condition, int code) {
        if (condition) {
            throw new AppException(code);
        }
    }

    /**
     * Require false với message tùy chỉnh
     * @param condition Điều kiện phải sai
     * @param code Error code từ ErrorConfig
     * @param message Custom error message
     * @throws AppException nếu condition = true
     */
    public static void requireFalse(boolean condition, int code, String message) {
        if (condition) {
            throw new AppException(code, message);
        }
    }

    /**
     * Throw User Not Found exception
     * @throws AppException
     */
    public static void throwUserNotFound() {
        throw new AppException(ErrorConfig.USER_NOT_FOUND);
    }

    /**
     * Throw User Not Found exception với custom message
     * @param message Custom error message
     * @throws AppException
     */
    public static void throwUserNotFound(String message) {
        throw new AppException(ErrorConfig.USER_NOT_FOUND, message);
    }

    /**
     * Throw Product Not Found exception
     * @throws AppException
     */
    public static void throwProductNotFound() {
        throw new AppException(ErrorConfig.PRODUCT_NOT_FOUND);
    }

    /**
     * Throw Product Not Found exception với custom message
     * @param message Custom error message
     * @throws AppException
     */
    public static void throwProductNotFound(String message) {
        throw new AppException(ErrorConfig.PRODUCT_NOT_FOUND, message);
    }

    /**
     * Throw Order Not Found exception
     * @throws AppException
     */
    public static void throwOrderNotFound() {
        throw new AppException(ErrorConfig.ORDER_NOT_FOUND);
    }

    /**
     * Throw Order Not Found exception với custom message
     * @param message Custom error message
     * @throws AppException
     */
    public static void throwOrderNotFound(String message) {
        throw new AppException(ErrorConfig.ORDER_NOT_FOUND, message);
    }

    /**
     * Throw Access Denied exception
     * @throws AppException
     */
    public static void throwAccessDenied() {
        throw new AppException(ErrorConfig.ACCESS_DENIED);
    }

    /**
     * Throw Access Denied exception với custom message
     * @param message Custom error message
     * @throws AppException
     */
    public static void throwAccessDenied(String message) {
        throw new AppException(ErrorConfig.ACCESS_DENIED, message);
    }

    /**
     * Throw Invalid Credentials exception
     * @throws AppException
     */
    public static void throwInvalidCredentials() {
        throw new AppException(ErrorConfig.INVALID_CREDENTIALS);
    }

    /**
     * Throw Invalid Credentials exception với custom message
     * @param message Custom error message
     * @throws AppException
     */
    public static void throwInvalidCredentials(String message) {
        throw new AppException(ErrorConfig.INVALID_CREDENTIALS, message);
    }
}