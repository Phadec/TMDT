import { v4 as uuidv4 } from 'uuid';

/**
 * Utility functions for cart management
 */

const CART_ID_KEY = 'cartId';
const CART_EXPIRY_KEY = 'cartIdExpiry';
const TTL_DAYS = 30; // 30 ngày

/**
 * Lấy hoặc tạo cartId với TTL 30 ngày
 * @returns {string} cartId
 */
export const getOrCreateCartId = () => {
  try {
    const existingCartId = localStorage.getItem(CART_ID_KEY);
    const expiryTime = localStorage.getItem(CART_EXPIRY_KEY);
    
    // Kiểm tra xem cartId có tồn tại và chưa hết hạn không
    if (existingCartId && expiryTime) {
      const currentTime = new Date().getTime();
      const expiry = parseInt(expiryTime);
      
      // Nếu chưa hết hạn, trả về cartId hiện có
      if (currentTime < expiry) {
        return existingCartId;
      }
    }
    
    // Tạo cartId mới và set thời gian hết hạn
    const newCartId = uuidv4();
    const newExpiryTime = new Date().getTime() + (TTL_DAYS * 24 * 60 * 60 * 1000); // 30 ngày
    
    localStorage.setItem(CART_ID_KEY, newCartId);
    localStorage.setItem(CART_EXPIRY_KEY, newExpiryTime.toString());
    
    return newCartId;
  } catch (error) {
    console.error('Error managing cartId:', error);
    // Fallback: tạo UUID mới nếu có lỗi với localStorage
    return uuidv4();
  }
};

/**
 * Xóa cartId khỏi localStorage (khi user logout hoặc clear cart)
 */
export const clearCartId = () => {
  try {
    localStorage.removeItem(CART_ID_KEY);
    localStorage.removeItem(CART_EXPIRY_KEY);
  } catch (error) {
    console.error('Error clearing cartId:', error);
  }
};

/**
 * Kiểm tra xem cartId có hết hạn không
 * @returns {boolean} true nếu hết hạn, false nếu còn hiệu lực
 */
export const isCartIdExpired = () => {
  try {
    const expiryTime = localStorage.getItem(CART_EXPIRY_KEY);
    if (!expiryTime) return true;
    
    const currentTime = new Date().getTime();
    const expiry = parseInt(expiryTime);
    
    return currentTime >= expiry;
  } catch (error) {
    console.error('Error checking cartId expiry:', error);
    return true;
  }
};

/**
 * Lấy thời gian còn lại của cartId (tính bằng ngày)
 * @returns {number} số ngày còn lại, -1 nếu đã hết hạn
 */
export const getCartIdRemainingDays = () => {
  try {
    const expiryTime = localStorage.getItem(CART_EXPIRY_KEY);
    if (!expiryTime) return -1;
    
    const currentTime = new Date().getTime();
    const expiry = parseInt(expiryTime);
    
    if (currentTime >= expiry) return -1;
    
    const remainingMs = expiry - currentTime;
    const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
    
    return remainingDays;
  } catch (error) {
    console.error('Error calculating remaining days:', error);
    return -1;
  }
};

/**
 * Xóa chỉ những sản phẩm đã đặt hàng khỏi giỏ hàng
 * @param {Array} orderedItems - Danh sách sản phẩm đã đặt hàng
 * @param {Function} removeFromCartOnly - Hàm xóa sản phẩm khỏi giỏ hàng
 * @param {Function} fetchCartItemCount - Hàm refresh số lượng giỏ hàng
 * @param {string} context - Ngữ cảnh (ví dụ: 'đặt hàng', 'thanh toán')
 * @returns {Promise<number>} Số lượng sản phẩm đã xóa thành công
 */
export const removeOrderedItemsFromCart = async (orderedItems, removeFromCartOnly, fetchCartItemCount, context = 'đặt hàng') => {
  try {
    const cartId = getOrCreateCartId();
    
    if (!orderedItems || !Array.isArray(orderedItems) || orderedItems.length === 0) {
      console.log('⚠️ Không có sản phẩm nào để xóa khỏi giỏ hàng');
      return 0;
    }
    
    console.log(`🗑️ Bắt đầu xóa ${orderedItems.length} sản phẩm đã ${context} khỏi giỏ hàng...`);
    
    // Xóa từng sản phẩm đã đặt hàng khỏi giỏ hàng
    let removedCount = 0;
    for (const item of orderedItems) {
      const productId = item.productId || item.id;
      if (productId) {
        try {
          await removeFromCartOnly(cartId, productId);
          removedCount++;
          console.log(`✅ Đã xóa sản phẩm ${productId} khỏi giỏ hàng`);
        } catch (itemError) {
          console.error(`❌ Lỗi khi xóa sản phẩm ${productId}:`, itemError);
        }
      } else {
        console.warn('⚠️ Sản phẩm không có ID:', item);
      }
    }
    
    // Refresh lại giỏ hàng sau khi xóa xong tất cả
    if (fetchCartItemCount) {
      await fetchCartItemCount();
    }
    
    console.log(`✅ Hoàn thành xóa ${removedCount}/${orderedItems.length} sản phẩm đã ${context} khỏi giỏ hàng`);
    return removedCount;
  } catch (error) {
    console.error(`❌ Lỗi khi xóa sản phẩm đã ${context} khỏi giỏ hàng:`, error);
    // Không throw error để không ảnh hưởng đến flow đặt hàng/thanh toán thành công
    return 0;
  }
};