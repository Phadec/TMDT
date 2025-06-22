# Cart Updates - Cập nhật trang giỏ hàng

## Các thay đổi đã thực hiện

### 1. ✅ Bỏ số lượng sản phẩm trong trang /cart
- Loại bỏ phần "Quantity controls" (nút +/- và hiển thị số lượng)
- Giỏ hàng giờ chỉ hiển thị sản phẩm mà không có tùy chọn thay đổi số lượng

### 2. ✅ Chức năng "Chọn tất cả" hoạt động
- **State management**: Thêm `selectedItems` và `selectAll` state
- **Checkbox "Chọn tất cả"**: 
  - Hiển thị số lượng đã chọn: `Chọn tất cả (2/5)`
  - Tự động cập nhật khi chọn/bỏ chọn từng item
- **Checkbox từng sản phẩm**: 
  - Đồng bộ với checkbox "Chọn tất cả"
  - Tự động bỏ chọn "Chọn tất cả" khi bỏ chọn một item
- **Nút "Xóa sản phẩm đã chọn"**:
  - Hiển thị số lượng: `Xóa sản phẩm đã chọn (3)`
  - Disabled khi không có sản phẩm nào được chọn
  - Xác nhận trước khi xóa

### 3. ✅ Hiển thị số lượng sản phẩm trên icon cart trong menu
- **CartContext**: Tạo context để quản lý state giỏ hàng toàn cục
- **Badge số lượng**: 
  - Hiển thị số đỏ trên icon cart
  - Hiển thị "99+" nếu > 99 sản phẩm
  - Ẩn khi giỏ hàng trống
- **Tooltip**: Hiển thị "Giỏ hàng (5)" khi hover
- **Auto-update**: Tự động cập nhật khi thêm/xóa sản phẩm

### 4. ✅ Cập nhật số lượng khi xóa sản phẩm
- **Single remove**: Xóa 1 sản phẩm → tự động update badge
- **Bulk remove**: Xóa nhiều sản phẩm → update badge một lần
- **Performance**: Tránh gọi API nhiều lần không cần thiết

## Cấu trúc code mới

### CartContext (`src/contexts/CartContext.jsx`)
```javascript
const { 
  cartItemCount,        // Số lượng sản phẩm
  cartItems,           // Danh sách sản phẩm
  loading,             // Trạng thái loading
  addToCart,           // Thêm sản phẩm
  removeFromCart,      // Xóa sản phẩm (auto refresh)
  removeFromCartOnly,  // Xóa sản phẩm (không auto refresh)
  clearCart,           // Xóa toàn bộ giỏ hàng
  refreshCart          // Refresh thủ công
} = useCart();
```

### Header với badge
```javascript
// Icon cart với badge số lượng
{isCartIcon && cartItemCount > 0 && (
  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-md">
    {cartItemCount > 99 ? '99+' : cartItemCount}
  </span>
)}
```

### Cart với checkbox
```javascript
// Checkbox chọn tất cả
<input 
  type="checkbox" 
  checked={selectAll}
  onChange={(e) => handleSelectAll(e.target.checked)}
/> 
Chọn tất cả ({selectedItems.length}/{cartItems.length})

// Nút xóa nhiều sản phẩm
<button 
  onClick={handleRemoveSelectedItems}
  disabled={selectedItems.length === 0}
>
  Xóa sản phẩm đã chọn ({selectedItems.length})
</button>
```

## Luồng hoạt động

### Khi thêm sản phẩm:
1. User click "Thêm vào giỏ hàng" → `addToCart()`
2. API call → `addToCartWithManagedId()`
3. Success → `fetchCartItemCount()` 
4. Update `cartItemCount` → Badge tự động update

### Khi xóa sản phẩm:
1. User click "Xóa" → `handleRemoveFromCart()`
2. API call → `removeFromCart()` (auto refresh)
3. Success → `fetchCartItemCount()` + local state update
4. Badge và UI tự động update

### Khi xóa nhiều sản phẩm:
1. User chọn nhiều sản phẩm → `selectedItems` update
2. User click "Xóa đã chọn" → `handleRemoveSelectedItems()`
3. Loop: `removeFromCartOnly()` (không auto refresh)
4. Sau khi xóa hết → `refreshCart()` một lần
5. Badge và UI update

## Lợi ích

✅ **UX tốt hơn**: Badge số lượng rõ ràng, checkbox hoạt động đúng  
✅ **Performance**: Giảm số lần gọi API không cần thiết  
✅ **Consistency**: State đồng bộ giữa các component  
✅ **Maintainability**: Code sạch, dễ bảo trì với Context pattern  
✅ **Real-time**: Cập nhật số lượng ngay lập tức khi có thay đổi