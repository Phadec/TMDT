const Code = {
  OK: 200, // Thành công
  CREATED: 201, // Đã tạo
  FOUND: 302, // Đã tìm thấy
  BAD_REQUEST: 400, // Yêu cầu không hợp lệ
  UNAUTHORIZED: 401, // Không được xác thực
  FORBIDDEN: 403, // Bị cấm truy cập
  NOT_FOUND: 404, // Không tìm thấy
  TOO_MANY_REQUEST: 429, // Gửi quá nhiều yêu cầu
  INTERNAL_SERVER_ERROR: 500, // Lỗi nội bộ server
};


export default Code;