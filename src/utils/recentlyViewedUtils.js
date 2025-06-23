/**
 * Utility functions for managing recently viewed products in localStorage
 */

const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts';
const MAX_RECENTLY_VIEWED = 20;

/**
 * Lấy danh sách ID sản phẩm đã xem gần đây từ localStorage
 * @returns {Array} - Mảng ID sản phẩm
 */
export const getRecentlyViewedIds = () => {
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting recently viewed products:', error);
    return [];
  }
};

/**
 * Thêm sản phẩm vào danh sách recently viewed
 * @param {string} productId - ID của sản phẩm
 */
export const addToRecentlyViewed = (productId) => {
  try {
    if (!productId) return;
    
    let recentlyViewed = getRecentlyViewedIds();
    recentlyViewed = recentlyViewed.filter(id => id !== productId.toString());
    recentlyViewed.unshift(productId.toString());
    
    if (recentlyViewed.length > MAX_RECENTLY_VIEWED) {
      recentlyViewed = recentlyViewed.slice(0, MAX_RECENTLY_VIEWED);
    }
    
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewed));
  } catch (error) {
    console.error('Error adding to recently viewed:', error);
  }
};

/**
 * Lấy N sản phẩm đã xem gần đây nhất
 * @param {number} limit - Số lượng sản phẩm cần lấy
 * @returns {Array} - Mảng ID sản phẩm
 */
export const getTopRecentlyViewed = (limit = 8) => {
  const recentlyViewed = getRecentlyViewedIds();
  return recentlyViewed.slice(0, limit);
};

/**
 * Chuyển đổi mảng ID thành chuỗi để gửi qua API
 * @param {Array} recentlyViewedIds - Mảng ID sản phẩm
 * @returns {string} - Chuỗi ID cách nhau bởi dấu phẩy
 */
export const recentlyViewedIdsToString = (recentlyViewedIds = []) => {
  return recentlyViewedIds.join(',');
};