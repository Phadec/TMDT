# Test Checkout với Địa chỉ Người bán

## Các thay đổi đã thực hiện:

### 1. **Cập nhật GHN Service** (`src/services/ghnService.js`)
- ✅ Thêm function `parseAddressToGHNIds()` để parse địa chỉ thành district_id và ward_code
- ✅ Function này sẽ:
  - Tách địa chỉ theo dấu phẩy
  - Tìm tỉnh, quận/huyện, phường/xã từ GHN API
  - Trả về district_id và ward_code tương ứng

### 2. **Cập nhật API Services** (`src/api/services.jsx`)
- ✅ Thêm function `getProductWithSellerInfo()` để lấy thông tin sản phẩm kèm thông tin người bán

### 3. **Cập nhật Checkout Page** (`src/pages/checkout/Checkout.jsx`)
- ✅ Thêm state `sellerInfo` để lưu thông tin người bán
- ✅ Trong `useEffect` lấy sản phẩm:
  - Gọi API lấy chi tiết sản phẩm với thông tin người bán
  - Parse địa chỉ người bán để lấy `district_id` và `ward_code`
  - Lưu vào state `sellerInfo`
- ✅ Cập nhật tính phí ship:
  - Sử dụng `sellerInfo.districtId` và `sellerInfo.wardCode` thay vì giá trị mặc định
  - Thêm dependency `sellerInfo` vào useEffect
- ✅ Cập nhật hiển thị:
  - Hiển thị địa chỉ người bán trong thông báo phí ship
  - Sử dụng địa chỉ người bán thực tế trong order data

## Cách hoạt động:

### 1. **Khi user vào trang checkout:**
```javascript
// Lấy sản phẩm từ localStorage
const selectedProducts = JSON.parse(localStorage.getItem('selectedCheckoutItems'));

// Lấy thông tin chi tiết sản phẩm đầu tiên
const productDetail = await apiServices.products.getProductWithSellerInfo(productId);

// Parse địa chỉ người bán
const sellerAddress = productDetail.data.customer.addresses;
const parsedSellerAddress = await ghnService.parseAddressToGHNIds(sellerAddress);

// Lưu thông tin người bán
setSellerInfo({
  address: sellerAddress,
  districtId: parsedSellerAddress.districtId,
  wardCode: parsedSellerAddress.wardCode
});
```

### 2. **Khi tính phí ship:**
```javascript
const shippingData = {
  insurance_value: totalAmount,
  from_district_id: parseInt(sellerInfo.districtId), // Từ API sản phẩm
  from_ward_code: sellerInfo.wardCode,               // Từ API sản phẩm
  to_district_id: parseInt(parsedAddress.districtId),
  to_ward_code: parsedAddress.wardCode,
  // ... other params
};
```

### 3. **API Call format:**
```
GET http://localhost:8080/api/v1/common/products/{product_id}
```

**Response expected:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "66",
    "name": "nhọng ngủ cho bé",
    "customer": {
      "id": "66",
      "fullName": "Brandie Pulford",
      "addresses": "9007 Merchant Drive"  // ← Địa chỉ này sẽ được parse
    }
  }
}
```

## Fallback Strategy:

Nếu không thể lấy hoặc parse địa chỉ người bán:
- Sử dụng địa chỉ mặc định: "P.1, Q.1, TP.HCM"
- district_id: "1454" (Quận 1, TP.HCM)
- ward_code: "21211" (Phường 1, Quận 1)

## Testing:

### 1. **Test với địa chỉ người bán thật:**
- Đảm bảo API `GET /api/v1/common/products/{id}` trả về đúng format
- Địa chỉ người bán phải có format: "Số nhà, Phường/Xã, Quận/Huyện, Tỉnh"

### 2. **Test GHN API:**
- Cần có `VITE_GHN_API_TOKEN` trong file `.env`
- Test parse địa chỉ với các format khác nhau

### 3. **Test UI:**
- Kiểm tra hiển thị thông tin "Phí vận chuyển từ [địa chỉ người bán] đến [địa chỉ người mua]"
- Kiểm tra tính phí ship chính xác

## Lưu ý:

1. **API Backend cần support:** Endpoint `GET /api/v1/common/products/{id}` phải trả về thông tin `customer.addresses`

2. **Format địa chỉ:** Địa chỉ người bán trong database nên có format chuẩn để parse được

3. **Performance:** Việc parse địa chỉ sẽ gọi nhiều API GHN, có thể cần cache

4. **Error Handling:** Đã có fallback khi không parse được địa chỉ

## Kết quả mong đợi:

- ✅ Phí ship được tính chính xác từ địa chỉ người bán thực tế
- ✅ Hiển thị rõ ràng địa chỉ gửi hàng cho user
- ✅ Fallback an toàn khi có lỗi
- ✅ Tương thích với hệ thống hiện tại