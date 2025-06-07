const OK = 200; // Thành công
const CREATED = 201; // Đã tạo
const FOUND = 302; // Đã tìm thấy
const BAD_REQUEST = 400; // Yêu cầu không hợp lệ
const UNAUTHORIZED = 401; // Không được xác thực
const FORBIDDEN = 403; // Bị cấm truy cập
const NOT_FOUND = 404; // Không tìm thấy
const TOO_MANY_REQUEST = 429; // Gửi quá nhiều yêu cầu
const INTERNAL_SERVER_ERROR = 500; // Lỗi nội bộ server

export {
  OK,
  CREATED,
  FOUND,
  BAD_REQUEST,
  UNAUTHORIZED,
  FORBIDDEN,
  NOT_FOUND,
  TOO_MANY_REQUEST,
  INTERNAL_SERVER_ERROR,
};
