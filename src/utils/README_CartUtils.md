# Cart Utils - Quản lý CartId với TTL

## Mô tả
Hệ thống quản lý CartId tự động với thời gian sống (TTL) 30 ngày, tránh việc tạo UUID mới mỗi lần thêm sản phẩm vào giỏ hàng.

## Tính năng
- **TTL 30 ngày**: CartId tự động hết hạn sau 30 ngày
- **Tái sử dụng**: Sử dụng lại cartId đã có nếu chưa hết hạn
- **Tự động tạo mới**: Tạo cartId mới khi hết hạn hoặc chưa có
- **Error handling**: Xử lý lỗi localStorage gracefully

## Cách sử dụng

### 1. Import utilities
```javascript
import { getOrCreateCartId, clearCartId, isCartIdExpired } from '~/utils/cartUtils';
```

### 2. Lấy cartId
```javascript
// Tự động lấy cartId hiện có hoặc tạo mới với TTL 30 ngày
const cartId = getOrCreateCartId();
```

### 3. Sử dụng trong API
```javascript
// Sử dụng method mới trong apiServices
const response = await apiServices.cart.addToCartWithManagedId(productData);

// Hoặc lấy cartId hiện tại
const currentCartId = apiServices.cart.getCurrentCartId();
```

### 4. Clear cart khi cần
```javascript
// Khi user logout hoặc muốn clear cart
apiServices.cart.clearCart();
// hoặc
clearCartId();
```

## API Methods mới

### `apiServices.cart.addToCartWithManagedId(productData)`
- Tự động quản lý cartId với TTL
- Chỉ cần truyền dữ liệu sản phẩm và khách hàng
- CartId được tự động thêm vào

### `apiServices.cart.getCurrentCartId()`
- Lấy cartId hiện tại
- Trả về cartId có sẵn hoặc tạo mới nếu cần

### `apiServices.cart.clearCart()`
- Xóa cartId khỏi localStorage
- Sử dụng khi logout hoặc clear cart

## Lưu trữ
- **Key**: `cartId` - Lưu UUID của cart
- **Key**: `cartIdExpiry` - Lưu timestamp hết hạn
- **Storage**: localStorage
- **TTL**: 30 ngày (có thể thay đổi trong `cartUtils.js`)

## Ví dụ sử dụng trong component

```javascript
import { getOrCreateCartId } from '~/utils/cartUtils';
import { apiServices } from '~/api';

const handleAddToCart = async (product) => {
  try {
    const productData = {
      customer: { /* customer data */ },
      product: [{ /* product data */ }]
    };
    
    // Sử dụng method mới - cartId tự động được quản lý
    const response = await apiServices.cart.addToCartWithManagedId(productData);
    
    console.log('Cart ID:', apiServices.cart.getCurrentCartId());
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Lợi ích
1. **Performance**: Giảm số lượng UUID được tạo
2. **Consistency**: Cùng một cartId trong 30 ngày
3. **User Experience**: Giỏ hàng được duy trì qua các session
4. **Maintainability**: Code sạch hơn, dễ bảo trì