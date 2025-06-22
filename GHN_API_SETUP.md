# Hướng dẫn lấy GHN API Token

## Bước 1: Đăng ký tài khoản GHN
1. Truy cập: https://5sao.ghn.dev/
2. Đăng ký tài khoản mới hoặc đăng nhập

## Bước 2: Lấy API Token
1. Vào phần **API Management** 
2. Tạo **Shop** mới (nếu chưa có)
3. Copy **Token** từ shop đã tạo

## Bước 3: Cập nhật .env
```env
VITE_GHN_API_TOKEN=your_real_token_here
```

## Bước 4: Test API
Sau khi có token thật, hệ thống sẽ:
- Tự động load danh sách tỉnh/thành phố
- Parse địa chỉ và tìm ID tương ứng
- Tính phí ship chính xác từ GHN

## Fallback hiện tại:
- Nếu không có token hợp lệ, hệ thống sẽ dùng mock data
- Phí ship mặc định: 35,000đ (miễn phí cho đơn hàng > 500k)
- Vẫn có thể test đầy đủ tính năng checkout

## Test với mock data:
Nhập địa chỉ: "123 Đường ABC, Xã Tân Lộc, Huyện Thới Bình, Cà Mau"
Hệ thống sẽ nhận diện và tính phí ship mock.