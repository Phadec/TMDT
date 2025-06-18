# API Endpoints Documentation - Chợ Việt E-commerce

## Tổng quan
API được tổ chức theo 3 nhóm chính:
- **Admin**: `/api/v1/admin` - Dành cho quản trị viên
- **Client**: `/api/v1/client` - Dành cho khách hàng
- **Common**: `/api/v1/common` - Chung cho cả admin và client

---

## 🔐 Authentication APIs

### Common Auth (`/api/v1/common/auth`)
- `POST /logout` - Đăng xuất
- `PUT /change` - Đổi mật khẩu
- `PUT /forgot` - Quên mật khẩu

### Client Auth (`/api/v1/client/auth`)
- `POST /login` - Đăng nhập khách hàng
- `POST /register` - Đăng ký khách hàng
- `PUT /{id}/status` - Cập nhật trạng thái tài khoản
- `GET /exist` - Kiểm tra email đã tồn tại

### Admin Auth (`/api/v1/admin/auth`)
- `POST /login` - Đăng nhập admin/user
- `POST /register` - Đăng ký user mới (mặc định role STAFF nếu không truyền role)

---

## 📧 Email Verification (`/api/v1/common/verify`)
- `POST /send` - Gửi email xác thực
- `POST /confirm` - Xác nhận token email

---

## 🛍️ Product APIs

### Common Products (`/api/v1/common/products`)
- `GET /` - Lấy danh sách sản phẩm (có phân trang)
- `GET /category/{id}` - Lấy sản phẩm theo danh mục

### Client Products (`/api/v1/client/products`)
- `GET /{id}` - Xem chi tiết sản phẩm

### Admin Products (`/api/v1/admin/products`)
- `POST /` - Tạo sản phẩm mới
- `POST /batch` - Tạo nhiều sản phẩm (xử lý bất đồng bộ)
- `PUT /{id}/status` - Cập nhật trạng thái sản phẩm

---

## 📦 Order APIs

### Client Orders (`/api/v1/client/orders`)
- `POST /` - Tạo đơn hàng mới
- `GET /get/status` - Lấy đơn hàng theo khách hàng và trạng thái
- `POST /get` - Lấy đơn hàng theo khách hàng
- `GET /detail` - Xem chi tiết đơn hàng

### Admin Orders (`/api/v1/admin/orders`)
- `GET /` - Lấy tất cả đơn hàng (có phân trang)
- `GET /status` - Lấy đơn hàng theo trạng thái
- `PUT /{orderId}/status` - Cập nhật trạng thái đơn hàng

---

## 👤 Profile APIs

### Client Profile (`/api/v1/client/profile`)
- `POST /view` - Xem thông tin cá nhân của khách hàng

---

## 👥 Customer Management (`/api/v1/admin/customers`)
- `GET /` - Lấy danh sách khách hàng (có phân trang)

---

## 👤 User Management (`/api/v1/admin/users`)
*Chưa có endpoint nào được implement*

---

## 🔧 Tính năng chính

### 🛡️ Bảo mật
- Hệ thống xác thực riêng biệt cho admin và client
- Xác thực email qua token
- Quản lý trạng thái tài khoản (ACTIVE, INACTIVE, SUSPENDED)

### 📊 Quản lý dữ liệu
- Phân trang cho tất cả danh sách
- Lọc theo trạng thái và danh mục
- Xử lý bất đồng bộ cho tác vụ nặng

### 🏪 E-commerce
- Quản lý sản phẩm theo danh mục
- Hệ thống đặt hàng hoàn chỉnh
- Theo dõi trạng thái đơn hàng
- Quản lý khách hàng

### 🔄 Tích hợp
- MongoDB cho lưu trữ dữ liệu
- RabbitMQ cho message queue
- Redis cho caching
- WebSocket cho real-time updates

---

## 📝 Response Format
Tất cả API đều trả về format chuẩn:
```json
{
  "code": "OK",
  "message": "success",
  "data": {...}
}
```

---

## 📋 API Details

### 👤 Profile - Xem thông tin cá nhân
**Endpoint**: `POST /api/v1/client/profile/view`

**Description**: Lấy thông tin chi tiết của khách hàng theo ID

**Request Body**:
```json
{
  "personId": "customer_id_here"
}
```

**Response**:
```json
{
  "code": "OK",
  "message": "Lấy thông tin cá nhân thành công",
  "data": {
    "token": null,
    "userType": "CUSTOMER",
    "id": "customer_id_here",
    "email": "customer@example.com",
    "fullname": "Nguyễn Văn A",
    "phone": "0123456789",
    "name": null,
    "roleName": null,
    "permission": null,
    "createdAt": "2024-01-01T10:00:00"
  }
}
```

**HTTP Status**: 200 OK

**Notes**: 
- Yêu cầu authentication
- Trả về thông tin cá nhân không bao gồm mật khẩu và thông tin nhạy cảm

## 🚀 Công nghệ sử dụng
- **Backend**: Spring Boot
- **Database**: MongoDB
- **Message Queue**: RabbitMQ
- **Cache**: Redis
- **Real-time**: WebSocket
- **Documentation**: Lombok annotations