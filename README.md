# Trello Clone

Trello Clone là một ứng dụng quản lý công việc dựa trên Trello, sử dụng **Spring Boot** cho backend và **ReactJS** cho frontend. Ứng dụng cho phép người dùng tạo bảng (boards), danh sách (lists), thẻ (cards) và sắp xếp công việc một cách linh hoạt.

## 🛠 Công nghệ sử dụng

### Backend (Spring Boot)
- Spring Boot (Spring Web, Spring Data MongoDB, Spring Security)
- MongoDB
- Java 17+
- Maven

### Frontend (ReactJS)
- ReactJS (Vite, React Router, Redux Toolkit)
- TypeScript

## 🚀 Cài đặt

### 1. Clone Repository
```sh
git clone https://github.com/Phadec/trello_clone.git
cd trello-clone
```

### 2. Cấu hình Backend
#### 📌 Yêu cầu:
- **MongoDB** (có thể sử dụng MongoDB Atlas hoặc cài đặt cục bộ)
- **Java 17+**
- **Maven**

#### Chạy backend
```sh
cd trello_clone
mvn spring-boot:run
```

### 3. Cấu hình Frontend
#### 📌 Yêu cầu:
- **Node.js 18+**
- **Yarn hoặc npm**

#### Cài đặt dependencies
```sh
cd frontend
yarn install  # hoặc npm install
```

#### Chạy frontend
```sh
yarn dev  # hoặc npm run dev
```

## 📌 Các API chính

| Method | Endpoint              | Mô tả                         |
|--------|----------------------|-------------------------------|
| POST   | `/api/v1/auth/register` | Đăng ký người dùng            |
| POST   | `/api/v1/auth/login`    | Đăng nhập và nhận JWT         |
| GET    | `/api/v1/board/user`        | Lấy danh sách bảng            |
| POST   | `/api/v1/boards`        | Tạo bảng mới                  |
| GET    | `/api/v1/lists/board/{boardId}` | Lấy danh sách trong một board |
| POST   | `/api/v1/cards`         | Thêm thẻ vào danh sách        |

## 📌 Tính năng
✅ Quản lý bảng, danh sách, thẻ
✅ Kéo thả để thay đổi vị trí thẻ (Drag & Drop)
✅ Đăng ký & đăng nhập với JWT Authentication
✅ Giao diện tối giản, trực quan

## 📜 Giấy phép
Dự án này được phân phối theo giấy phép Apache 2.0. Xem chi tiết tại [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

---
👉 **Hãy thử ngay!** 🚀

