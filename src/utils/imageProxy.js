/**
 * Image Proxy Utility
 * Xử lý việc lấy ảnh thông qua ImageProxyController
 */

// Base URL của backend
const BACKEND_BASE_URL = 'http://localhost:8080';

/**
 * Tạo URL ảnh thông qua ImageProxy
 * @param {string} originalUrl - URL ảnh gốc
 * @returns {string} - URL ảnh đã được proxy
 */
export const getProxyImageUrl = (originalUrl) => {
  // Kiểm tra nếu URL không hợp lệ
  if (!originalUrl || typeof originalUrl !== 'string') {
    return getPlaceholderImage();
  }

  // Nếu là placeholder hoặc base64, trả về URL gốc
  if (originalUrl.includes('placeholder') || 
      originalUrl.includes('data:image') || 
      originalUrl.includes('via.placeholder.com')) {
    return originalUrl;
  }

  // Nếu đã là URL proxy, trả về luôn
  if (originalUrl.includes('/image-proxy/image')) {
    return originalUrl;
  }

  try {
    // Encode URL để truyền qua query parameter
    const encodedUrl = encodeURIComponent(originalUrl);
    
    // Tạo URL proxy theo format: /api/v1/common/image-proxy/image?url=encodedUrl
    return `${BACKEND_BASE_URL}/api/v1/common/image-proxy/image?url=${encodedUrl}`;
  } catch (error) {
    console.error('Error creating proxy URL:', error);
    return getPlaceholderImage();
  }
};

/**
 * Tạo URL placeholder mặc định
 * @param {number} width - Chiều rộng ảnh
 * @param {number} height - Chiều cao ảnh
 * @param {string} text - Text hiển thị
 * @returns {string} - URL placeholder
 */
export const getPlaceholderImage = (width = 150, height = 150, text = 'No+Image') => {
  return `https://via.placeholder.com/${width}x${height}?text=${text}`;
};

/**
 * Xử lý lỗi khi load ảnh
 * @param {Event} event - Event object
 * @param {number} width - Chiều rộng ảnh fallback
 * @param {number} height - Chiều cao ảnh fallback
 */
export const handleImageError = (event, width = 150, height = 150) => {
  const img = event.target;
  if (img && !img.src.includes('placeholder')) {
    img.src = getPlaceholderImage(width, height);
  }
};

/**
 * Preload ảnh để cải thiện performance
 * @param {string[]} imageUrls - Mảng URL ảnh cần preload
 */
export const preloadImages = (imageUrls) => {
  if (!Array.isArray(imageUrls)) return;
  
  imageUrls.forEach(url => {
    if (url && typeof url === 'string') {
      const img = new Image();
      img.src = getProxyImageUrl(url);
    }
  });
};

/**
 * Tạo srcSet cho responsive images
 * @param {string} originalUrl - URL ảnh gốc
 * @param {number[]} sizes - Mảng các kích thước
 * @returns {string} - srcSet string
 */
export const createResponsiveSrcSet = (originalUrl, sizes = [150, 300, 600]) => {
  if (!originalUrl) return '';
  
  return sizes.map(size => {
    const proxyUrl = getProxyImageUrl(originalUrl);
    return `${proxyUrl}&w=${size} ${size}w`;
  }).join(', ');
};