package com.example.choviet.config;

public class Code {
    private Code() {
        throw new AssertionError("Cannot instantiate Constants class");
    }

    public static final int OK = 200; // Thành công
    public static final int CREATED = 201; // Đã tạo
    public static final int FOUND = 302; // Đã tìm thấy
    public static final int BAD_REQUEST = 400; // Yêu cầu không hợp lệ
    public static final int UNAUTHORIZED = 401; // Không được xác thực
    public static final int FORBIDDEN = 403; // Bị cấm truy cập
    public static final int NOT_FOUND = 404; //  Không tìm thấy
    public static final int TOO_MANY_REQUEST = 429; // Gửi quá nhiều yêu cầu
    public static final int INTERNAL_SERVER_ERROR = 500; // Lỗi nội bộ server
}

