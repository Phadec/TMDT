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