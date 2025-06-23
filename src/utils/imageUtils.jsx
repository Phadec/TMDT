function getImageFromAssets(imageName, folder = "") {
  return folder ? `/assets/${folder}/${imageName}` : `/assets/${imageName}`;
}

/**
 * Tạo URL cho ImageProxy để lấy ảnh từ external URLs
 * @param {string} imageUrl - URL gốc của ảnh cần proxy
 * @returns {string} URL đã được proxy qua ImageProxyController
 */
function getProxiedImageUrl(imageUrl) {
  if (!imageUrl) return null;
  
  // Nếu là URL tương đối hoặc đã là URL local, trả về như cũ
  if (imageUrl.startsWith('/') || imageUrl.startsWith(window.location.origin)) {
    return imageUrl;
  }
  
  // Encode URL để truyền qua query parameter
  const encodedUrl = encodeURIComponent(imageUrl);
  
  // Tạo URL proxy
  return `/api/v1/common/image-proxy/image?url=${encodedUrl}`;
}

/**
 * Lấy URL ảnh an toàn với fallback
 * @param {string} imageUrl - URL gốc của ảnh
 * @param {string} fallbackImage - Ảnh fallback nếu URL gốc không hợp lệ
 * @returns {string} URL ảnh đã được xử lý
 */
function getSafeImageUrl(imageUrl, fallbackImage = null) {
  if (!imageUrl) {
    return fallbackImage || getImageFromAssets('demo.jpg', 'home/demo');
  }
  
  return getProxiedImageUrl(imageUrl);
}

/**
 * Lấy URL demo image để làm fallback chính
 * @returns {string} URL của demo.jpg
 */
function getDemoImageUrl() {
  return getImageFromAssets('demo.jpg', 'home/demo');
}

export { getImageFromAssets, getProxiedImageUrl, getSafeImageUrl, getDemoImageUrl };
