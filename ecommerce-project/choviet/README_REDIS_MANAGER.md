# Redis Management System - ChoViet

## Tổng quan
Hệ thống quản lý Redis keys cho ứng dụng ChoViet, cung cấp giao diện web để quản lý, theo dõi và thao tác với các Redis keys.

## Tính năng

### 🔍 Tìm kiếm và Lọc
- Tìm kiếm keys theo pattern (wildcards)
- Phân trang để xử lý nhiều keys
- Thống kê tổng quan về Redis

### 📊 Xem Chi tiết Key
- Hiển thị type, TTL và value của key
- Hỗ trợ tất cả các loại data type của Redis:
  - String
  - List
  - Set
  - Hash
  - Sorted Set (ZSet)
  - Stream

### ✏️ Chỉnh sửa
- Thêm key mới với value JSON
- Chỉnh sửa value của key đã có
- Set TTL (Time To Live) cho keys
- Hỗ trợ các đơn vị thời gian: Seconds, Minutes, Hours, Days

### 🗑️ Xóa
- Xóa key đơn lẻ
- Xóa nhiều keys theo pattern
- Flush tất cả keys (với xác nhận an toàn)

## Cài đặt và Sử dụng

### 1. Cấu hình Redis
Đảm bảo Redis đã được cấu hình trong `application.properties`:

```properties
# Redis Configuration
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.data.redis.timeout=5000
```

### 2. Truy cập Giao diện
- URL: `http://localhost:8080/admin/redis-manager.html`
- Hoặc: `http://localhost:8080/admin/redis-manager`

### 3. API Endpoints

#### Thông tin tổng quan
```
GET /admin/redis/info
```

#### Tìm kiếm keys
```
GET /admin/redis/keys?pattern=*&page=0&size=20
```

#### Chi tiết key
```
GET /admin/redis/key/{keyName}
```

#### Thêm/Sửa key
```
PUT /admin/redis/key/{keyName}
Content-Type: application/json

{
  "value": "your-value",
  "timeout": 3600,  // optional
  "unit": "SECONDS" // optional
}
```

#### Set TTL
```
PUT /admin/redis/key/{keyName}/expire?timeout=3600&unit=SECONDS
```

#### Xóa key
```
DELETE /admin/redis/key/{keyName}
```

#### Xóa nhiều keys
```
DELETE /admin/redis/keys?pattern=user:*
```

#### Flush tất cả
```
DELETE /admin/redis/flush
```

## Cấu trúc Files

```
src/main/
├── java/com/example/choviet/
│   ├── service/
│   │   └── RedisManagementService.java     # Service xử lý Redis operations
│   └── controller/admin/
│       ├── RedisManagementController.java  # REST API endpoints
│       └── AdminViewController.java        # View controller
└── resources/static/admin/
    ├── redis-manager.html                  # Giao diện chính
    ├── redis-manager.js                    # JavaScript logic
    └── redis-manager.css                   # Custom styles
```

## Bảo mật

⚠️ **Quan trọng**: Hệ thống này cung cấp quyền truy cập đầy đủ vào Redis database. Trong môi trường production:

1. Thêm xác thực và phân quyền
2. Giới hạn các operations nguy hiểm
3. Logging các thao tác quan trọng
4. Sử dụng HTTPS

## Tùy chỉnh

### Thêm Pattern Mới
Để thêm pattern search phổ biến, chỉnh sửa `redis-manager.js`:

```javascript
// Thêm vào hàm loadRedisInfo()
const commonPatterns = ['user:*', 'session:*', 'cache:*'];
```

### Tùy chỉnh TTL Units
Để thêm đơn vị thời gian mới, chỉnh sửa select options trong HTML:

```html
<option value="WEEKS">Weeks</option>
<option value="MONTHS">Months</option>
```

## Troubleshooting

### Redis Connection Issues
1. Kiểm tra Redis server đang chạy: `redis-cli ping`
2. Kiểm tra cấu hình connection trong `application.properties`
3. Kiểm tra firewall/network connectivity

### Performance Issues
1. Sử dụng pattern cụ thể thay vì `*`
2. Giảm page size khi có quá nhiều keys
3. Xem xét sử dụng Redis SCAN thay vì KEYS cho production

### Memory Issues
1. Monitor Redis memory usage: `redis-cli info memory`
2. Set TTL hợp lý cho các keys
3. Xem xét sử dụng Redis eviction policies

## Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - xem file LICENSE để biết thêm chi tiết.
