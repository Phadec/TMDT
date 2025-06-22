import { commonApi} from './api';
import { commonUrl } from './endpoint';

/**
 * Service API chung cho toàn bộ ứng dụng
 * Tập hợp các hàm gọi API được tái sử dụng
 */
const apiServices = {
  /**
   * API liên quan đến sản phẩm
   */
  products: {
    /**
     * Lấy danh sách sản phẩm có phân trang
     * @param {number} page - Số trang (bắt đầu từ 0)
     * @param {number} size - Số lượng sản phẩm mỗi trang
     * @returns {Promise} - Promise chứa danh sách sản phẩm
     */
    getProducts: async (page = 0, size = 10) => {
      try {        
        const response = await commonApi.get(commonUrl.product.getAll, {
          params: { page, size }
        });
        return response;
      } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
    },

    /**
     * Lấy chi tiết sản phẩm theo ID
     * @param {string} id - ID của sản phẩm
     * @returns {Promise} - Promise chứa thông tin chi tiết sản phẩm
     */
    getProductById: async (id) => {
      try {
        const response = await commonApi.get(commonUrl.product.detail(id));
        return response;
      } catch (error) {
        console.error(`Error fetching product with ID ${id}:`, error);
        throw error;
      }
    },

    /**
     * Lấy danh sách sản phẩm theo danh mục
     * @param {string} categoryId - ID của danh mục
     * @param {number} page - Số trang (bắt đầu từ 0)
     * @param {number} size - Số lượng sản phẩm mỗi trang
     * @returns {Promise} - Promise chứa danh sách sản phẩm theo danh mục
     */
    getProductsByCategory: async (categoryId, page = 0, size = 10) => {
      try {
        // Thêm endpoint vào commonUrl nếu chưa có
        if (!commonUrl.products) {
          commonUrl.products = {};
        }
        
        if (!commonUrl.products.getByCategory) {
          commonUrl.products.getByCategory = (catId) => `/products/category/${catId}`;
        }
        
        const response = await commonApi.get(commonUrl.products.getByCategory(categoryId), {
          params: { page, size }
        });
        return response;
      } catch (error) {
        console.error(`Error fetching products for category ${categoryId}:`, error);
        throw error;
      }
    },

    /**
     * Lấy danh sách sản phẩm tương đồng dựa trên mô hình transformer
     * @param {string} productId - ID của sản phẩm cần tìm sản phẩm tương đồng
     * @param {number} limit - Số lượng sản phẩm tương đồng cần lấy
     * @returns {Promise} - Promise chứa danh sách sản phẩm tương đồng
     */
    getSimilarProducts: async (productId, limit = 6) => {
      try {
        const response = await commonApi.get(commonUrl.product.similar(productId), {
          params: { limit }
        });
        return response;
      } catch (error) {
        console.error(`Error fetching similar products for product ${productId}:`, error);
        throw error;
      }
    },

    /**
     * Lấy danh sách đánh giá của sản phẩm
     * @param {string} productId - ID của sản phẩm cần lấy đánh giá
     * @param {number} page - Số trang (bắt đầu từ 0)
     * @param {number} size - Số lượng đánh giá mỗi trang
     * @returns {Promise} - Promise chứa danh sách đánh giá sản phẩm
     */
    getProductReviews: async (productId, page = 0, size = 10) => {
      try {
        const response = await commonApi.get(commonUrl.product.reviews(productId), {
          params: { page, size }
        });
        return response;
      } catch (error) {
        console.error(`Error fetching reviews for product ${productId}:`, error);
        throw error;
      }
    }
  },

  /**
   * Utility functions for data transformation
   */
  utils: {
    /**
     * Transform user/customer data from backend to frontend format
     * @param {Object} backendUser - User data from backend
     * @param {string} userType - "users" or "customers"
     * @returns {Object} - Transformed user data
     */
    transformUserData: (backendUser, userType = "users") => {
      return {
        id: backendUser.id,
        name: backendUser.fullName || backendUser.name || `User ${backendUser.id}`,
        email: backendUser.email,
        phone: backendUser.phone || "Chưa có",
        role: userType === "users" 
          ? (backendUser.role?.roleName?.toLowerCase() || "user") 
          : "customer",
        status: backendUser.status ? backendUser.status.toLowerCase() : "active",
        createdAt: backendUser.createdAt,
        lastLogin: backendUser.lastLogin || backendUser.updatedAt || backendUser.updateAt || backendUser.createdAt,
        postsCount: backendUser.postsCount || 0,
        avatar: backendUser.avatar || "https://via.placeholder.com/150",
        address: backendUser.addresses && backendUser.addresses.length > 0 
          ? (Array.isArray(backendUser.addresses) ? backendUser.addresses.join(", ") : backendUser.addresses)
          : "Chưa có địa chỉ",
        bio: backendUser.bio || "Chưa có thông tin giới thiệu",
        verified: backendUser.verified || false,
        isSeller: backendUser.isSeller || false,
        roleObject: backendUser.role
      };
    },

    /**
     * Handle API errors consistently
     * @param {Error} error - Error from API call
     * @param {string} operation - Operation being performed
     * @returns {string} - User-friendly error message
     */
    handleApiError: (error, operation = "thao tác") => {
      console.error(`Error in ${operation}:`, error);
      
      if (error.status === 401) {
        return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      } else if (error.status === 403) {
        return "Bạn không có quyền thực hiện thao tác này.";
      } else if (error.status === 404) {
        return "Không tìm thấy dữ liệu yêu cầu.";
      } else if (error.status >= 500) {
        return "Lỗi hệ thống. Vui lòng thử lại sau.";
      } else if (error.message) {
        return error.message;
      } else {
        return `Có lỗi xảy ra trong quá trình ${operation}.`;
      }
    }
  }
};

export default apiServices;