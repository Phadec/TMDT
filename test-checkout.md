# Test Checkout Implementation

## Các tính năng đã implement:

### 1. Parse địa chỉ tự động
- Input: "123 Đường ABC, Xã Tân Lộc, Huyện Thới Bình, Cà Mau"
- Parse thành:
  - Tỉnh: Cà Mau
  - Quận/Huyện: Huyện Thới Bình  
  - Phường/Xã: Xã Tân Lộc

### 2. Tính phí ship từ GHN API
- Tự động gọi API GHN để tính phí ship
- Sử dụng thông tin địa chỉ đã parse
- Hiển thị phí ship real-time

### 3. Discount code
- Input để nhập mã giảm giá
- Mock codes: NEWUSER10 (10%), SALE20 (20%), VIP30 (30%)
- Tính toán giảm giá tự động

### 4. API Order mới
- Format theo yêu cầu: POST /api/v1/client/orders
- Bao gồm customer, product, address, payment, discount info

## Cách test:

1. Vào trang /checkout
2. Nhập địa chỉ theo format: "Số nhà, Phường/Xã, Quận/Huyện, Tỉnh"
3. Xem phí ship được tính tự động
4. Nhập mã giảm giá (VD: NEWUSER10)
5. Chọn COD và đặt hàng

## Lưu ý:
- Cần có VITE_GHN_API_TOKEN trong file .env
- API backend cần support endpoint /api/v1/client/orders