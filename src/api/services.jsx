import { commonApi, clientApi, adminApi } from './api';
import { commonUrl, clientUrl, adminUrl } from './endpoint';

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
        // Thêm endpoint vào commonUrl nếu chưa có
        if (!commonUrl.products) {
          commonUrl.products = {
            getAll: '/products'
          };
        }
        
        const response = await commonApi.get(commonUrl.products.getAll, {
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
        // Thêm endpoint vào commonUrl nếu chưa có
        if (!commonUrl.products) {
          commonUrl.products = {};
        }
        
        if (!commonUrl.products.getById) {
          commonUrl.products.getById = (productId) => `/products/${productId}`;
        }
        
        const response = await commonApi.get(commonUrl.products.getById(id));
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
    }
  },

  /**
   * API liên quan đến xác thực người dùng
   */
  auth: {
    /**
     * Đăng nhập
     * @param {Object} credentials - Thông tin đăng nhập
     * @returns {Promise} - Promise chứa thông tin người dùng và token
     */
    login: async (credentials) => {
      try {
        const response = await clientApi.post(clientUrl.auth.login, credentials);
        return response;
      } catch (error) {
        console.error('Error during login:', error);
        throw error;
      }
    },

    /**
     * Đăng ký
     * @param {Object} userData - Thông tin người dùng đăng ký
     * @returns {Promise} - Promise chứa kết quả đăng ký
     */
    register: async (userData) => {
      try {
        const response = await clientApi.post(clientUrl.auth.register, userData);
        return response;
      } catch (error) {
        console.error('Error during registration:', error);
        throw error;
      }
    },

    /**
     * Đăng xuất
     * @returns {Promise} - Promise chứa kết quả đăng xuất
     */
    logout: async () => {
      try {
        const response = await commonApi.post(commonUrl.auth.logout);
        return response;
      } catch (error) {
        console.error('Error during logout:', error);
        throw error;
      }
    }
  }
};

export default apiServices;