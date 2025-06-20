package com.example.choviet.config;

public interface Code {
    int OK = 200; // Thành công
    int CREATED = 201; // Đã tạo
    int FOUND = 302; // Đã tìm thấy
    int BAD_REQUEST = 400; // Yêu cầu không hợp lệ
    int UNAUTHORIZED = 401; // Không được xác thực
    int FORBIDDEN = 403; // Bị cấm truy cập
    int NOT_FOUND = 404; //  Không tìm thấy
    int TOO_MANY_REQUEST = 429; // Gửi quá nhiều yêu cầu
    int INTERNAL_SERVER_ERROR = 500; // Lỗi nội bộ server
}

