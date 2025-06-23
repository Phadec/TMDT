import { commonUrl } from "~/api";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

function getImageFromAssets(imageName, folder = "") {
  return folder ? `/assets/${folder}/${imageName}` : `/assets/${imageName}`;
}

/**
 * Kiểm tra xem URL có phải là external URL không
 * @param {string} url - URL cần kiểm tra
 * @returns {boolean} true nếu là external URL
 */
function isExternalUrl(url) {
  if (!url) return false;
  
  // Nếu bắt đầu với protocol
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Kiểm tra xem có phải là domain hiện tại không
    try {
      const urlObj = new URL(url);
      const currentHost = window.location.host;
      return urlObj.host !== currentHost;
    } catch (e) {
      return true; // Nếu URL không hợp lệ, coi như external
    }
  }
  
  // URL tương đối hoặc absolute path
  return false;
}

/**
 * Tạo URL cho ImageProxy để lấy ảnh từ external URLs
 * @param {string} imageUrl - URL gốc của ảnh cần proxy
 * @param {Object} options - Tùy chọn cho image proxy
 * @param {number} options.width - Chiều rộng ảnh
 * @param {number} options.height - Chiều cao ảnh
 * @param {string} options.quality - Chất lượng ảnh (low, medium, high)
 * @returns {string} URL đã được proxy qua ImageProxyController
 */
function getProxiedImageUrl(imageUrl, options = {}) {
  if (!imageUrl) return null;
  
  // Nếu không phải external URL, trả về như cũ
  if (!isExternalUrl(imageUrl)) {
    return imageUrl;
  }
  
  // Encode URL để truyền qua query parameter
  const encodedUrl = encodeURIComponent(imageUrl);
  
  // Tạo URL proxy với BASE_URL đầy đủ
  let proxyUrl = `${BASE_URL}${commonUrl.imageProxy.getImage(encodedUrl)}`;
  
  // Thêm các tham số tùy chọn
  const params = new URLSearchParams();
  if (options.width) params.append('w', options.width);
  if (options.height) params.append('h', options.height);
  if (options.quality) params.append('q', options.quality);
  
  if (params.toString()) {
    proxyUrl += `&${params.toString()}`;
  }
  
  return proxyUrl;
}

/**
 * Lấy URL ảnh an toàn với fallback
 * @param {string} imageUrl - URL gốc của ảnh
 * @param {string} fallbackImage - Ảnh fallback nếu URL gốc không hợp lệ
 * @param {Object} options - Tùy chọn cho image proxy
 * @returns {string} URL ảnh đã được xử lý
 */
function getSafeImageUrl(imageUrl, fallbackImage = null, options = {}) {
  if (!imageUrl) {
    return fallbackImage || getImageFromAssets('demo.jpg', 'home/demo');
  }
  
  // Nếu imageUrl là một chuỗi rỗng hoặc chỉ chứa whitespace
  if (typeof imageUrl === 'string' && imageUrl.trim() === '') {
    return fallbackImage || getImageFromAssets('demo.jpg', 'home/demo');
  }
  
  return getProxiedImageUrl(imageUrl, options);
}

/**
 * Lấy URL demo image để làm fallback chính
 * @returns {string} URL của demo.jpg
 */
function getDemoImageUrl() {
  return getImageFromAssets('demo.jpg', 'home/demo');
}

/**
 * Tối ưu hóa URL ảnh cho carousel (kích thước nhỏ hơn)
 * @param {string} imageUrl - URL gốc của ảnh
 * @returns {string} URL ảnh đã được tối ưu
 */
function getOptimizedCarouselImageUrl(imageUrl) {
  return getSafeImageUrl(imageUrl, getDemoImageUrl(), {
    width: 400,
    height: 400,
    quality: 'medium'
  });
}

export { 
  getImageFromAssets, 
  getProxiedImageUrl, 
  getSafeImageUrl, 
  getDemoImageUrl, 
  getOptimizedCarouselImageUrl,
  isExternalUrl
};
