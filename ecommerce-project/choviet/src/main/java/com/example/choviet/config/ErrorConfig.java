package com.example.choviet.config;

import java.util.HashMap;
import java.util.Map;

/**
 * Error Configuration - Chứa tất cả error codes và messages
 * Tách riêng để dễ quản lý và maintain
 */
public class ErrorConfig {
    
    // ==================== HTTP STATUS CODES ====================
    public static final int SUCCESS = 200;
    public static final int BAD_REQUEST = 400;
    public static final int UNAUTHORIZED = 401;
    public static final int FORBIDDEN = 403;
    public static final int NOT_FOUND = 404;
    public static final int METHOD_NOT_ALLOWED = 405;
    public static final int INTERNAL_SERVER_ERROR = 500;
    
    // ==================== BUSINESS ERROR CODES ====================
    public static final int USER_NOT_FOUND = 1001;
    public static final int USER_ALREADY_EXISTS = 1002;
    public static final int INVALID_CREDENTIALS = 1003;
    public static final int TOKEN_EXPIRED = 1004;
    public static final int ACCESS_DENIED = 1005;
    public static final int PRODUCT_NOT_FOUND = 1006;
    public static final int PRODUCT_OUT_OF_STOCK = 1007;
    public static final int ORDER_NOT_FOUND = 1008;
    public static final int ORDER_CANNOT_CANCEL = 1009;
    public static final int PAYMENT_FAILED = 1010;
    public static final int CUSTOMER_NOT_FOUND = 1011;
    public static final int INVALID_DATA = 1012;
    public static final int BUSINESS_RULE_VIOLATION = 1013;
    public static final int EMAIL_ALREADY_EXISTS = 1014;
    public static final int PHONE_ALREADY_EXISTS = 1015;
    
    // ==================== ERROR MESSAGES ====================
    public static final Map<Integer, String> ERROR_MESSAGES = new HashMap<Integer, String>() {{
        // HTTP Status Messages
        put(BAD_REQUEST, "Yêu cầu không hợp lệ");
        put(UNAUTHORIZED, "Chưa xác thực");
        put(FORBIDDEN, "Không có quyền truy cập");
        put(NOT_FOUND, "Không tìm thấy");
        put(METHOD_NOT_ALLOWED, "Phương thức không được hỗ trợ");
        put(INTERNAL_SERVER_ERROR, "Lỗi hệ thống");
        
        // Business Error Messages
        put(USER_NOT_FOUND, "Không tìm thấy người dùng");
        put(USER_ALREADY_EXISTS, "Người dùng đã tồn tại");
        put(INVALID_CREDENTIALS, "Thông tin đăng nhập không chính xác");
        put(TOKEN_EXPIRED, "Token đã hết hạn");
        put(ACCESS_DENIED, "Không có quyền truy cập");
        put(PRODUCT_NOT_FOUND, "Không tìm thấy sản phẩm");
        put(PRODUCT_OUT_OF_STOCK, "Sản phẩm đã hết hàng");
        put(ORDER_NOT_FOUND, "Không tìm thấy đơn hàng");
        put(ORDER_CANNOT_CANCEL, "Không thể hủy đơn hàng");
        put(PAYMENT_FAILED, "Thanh toán thất bại");
        put(CUSTOMER_NOT_FOUND, "Không tìm thấy khách hàng");
        put(INVALID_DATA, "Dữ liệu không hợp lệ");
        put(BUSINESS_RULE_VIOLATION, "Vi phạm quy tắc nghiệp vụ");
        put(EMAIL_ALREADY_EXISTS, "Email đã tồn tại");
        put(PHONE_ALREADY_EXISTS, "Số điện thoại đã tồn tại");
    }};
    
    /**
     * Lấy error message theo code
     * @param code Error code
     * @return Error message tương ứng
     */
    public static String getMessage(int code) {
        return ERROR_MESSAGES.getOrDefault(code, "Lỗi không xác định");
    }
    
    /**
     * Kiểm tra xem code có phải là business error không
     * @param code Error code
     * @return true nếu là business error (1001-1999)
     */
    public static boolean isBusinessError(int code) {
        return code >= 1001 && code <= 1999;
    }
    
    /**
     * Kiểm tra xem code có phải là HTTP status code không
     * @param code Error code
     * @return true nếu là HTTP status code
     */
    public static boolean isHttpStatusCode(int code) {
        return code >= 200 && code <= 599;
    }
}