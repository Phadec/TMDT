import { commonApi, clientApi} from './api';
import { commonUrl, clientUrl } from './endpoint';
import { getOrCreateCartId, clearCartId } from '~/utils/cartUtils';

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
    },

    /**
     * Lấy thông tin chi tiết sản phẩm bao gồm thông tin người bán
     * @param {string} productId - ID của sản phẩm
     * @returns {Promise} - Promise chứa thông tin chi tiết sản phẩm và người bán
     */
    getProductWithSellerInfo: async (productId) => {
      try {
        const response = await commonApi.get(commonUrl.product.detail(productId));
        return response;
      } catch (error) {
        console.error(`Error fetching product with seller info for ID ${productId}:`, error);
        throw error;
      }
    }
  },

  /**
   * API liên quan đến giỏ hàng
   */
  cart: {
    /**
     * Thêm sản phẩm vào giỏ hàng
     * @param {Object} cartData - Dữ liệu giỏ hàng
     * @returns {Promise} - Promise chứa kết quả thêm vào giỏ hàng
     */
    addToCart: async (cartData) => {
      try {
        const response = await clientApi.post('/cart', cartData);
        return response;
      } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
      }
    },

    /**
     * Thêm sản phẩm vào giỏ hàng với cartId tự động quản lý
     * @param {Object} productData - Dữ liệu sản phẩm và khách hàng
     * @returns {Promise} - Promise chứa kết quả thêm vào giỏ hàng
     */
    addToCartWithManagedId: async (productData) => {
      try {
        // Tự động lấy hoặc tạo cartId với TTL 30 ngày
        const cartId = getOrCreateCartId();
        
        const cartData = {
          id: cartId,
          ...productData
        };
        
        const response = await clientApi.post('/cart', cartData);
        return response;
      } catch (error) {
        console.error('Error adding to cart with managed ID:', error);
        throw error;
      }
    },

    /**
     * Lấy danh sách sản phẩm trong giỏ hàng
     * @param {string} cartId - ID của giỏ hàng
     * @returns {Promise} - Promise chứa danh sách sản phẩm trong giỏ hàng
     */
    getCartItems: async (cartId) => {
      try {
        const response = await clientApi.get(`/cart?id=${cartId}`);
        return response;
      } catch (error) {
        console.error('Error fetching cart items:', error);
        throw error;
      }
    },

    /**
     * Kiểm tra sản phẩm đã tồn tại trong giỏ hàng
     * @param {string} cartId - ID của giỏ hàng
     * @param {string} productId - ID của sản phẩm cần kiểm tra
     * @returns {Promise<boolean>} - Promise chứa kết quả kiểm tra
     */
    checkProductInCart: async (cartId, productId) => {
      try {
        const response = await clientApi.get(`/cart?id=${cartId}`);
        if (response && Array.isArray(response)) {
          return response.some(item => item.productId === productId);
        }
        return false;
      } catch (error) {
        console.error('Error checking product in cart:', error);
        return false;
      }
    },

    /**
     * Xóa sản phẩm khỏi giỏ hàng
     * @param {string} cartId - ID của giỏ hàng
     * @param {string} productId - ID của sản phẩm cần xóa
     * @returns {Promise} - Promise chứa kết quả xóa sản phẩm
     */
    removeFromCart: async (cartId, productId) => {
      try {
        const response = await clientApi.delete(`/cart/delete?cardId=${cartId}&productId=${productId}`);
        return response;
      } catch (error) {
        console.error('Error removing from cart:', error);
        throw error;
      }
    },

    /**
     * Lấy cartId hiện tại từ localStorage
     * @returns {string|null} - cartId hoặc null nếu không có
     */
    getCurrentCartId: () => {
      return getOrCreateCartId();
    },

    /**
     * Xóa cartId khỏi localStorage (khi logout hoặc clear cart)
     */
    clearCart: () => {
      clearCartId();
    }
  },

  /**
   * API liên quan đến đơn hàng
   */
  order: {
    /**
     * Tạo đơn hàng mới
     * @param {Object} orderData - Dữ liệu đơn hàng
     * @returns {Promise} - Promise chứa kết quả tạo đơn hàng
     */
    createOrder: async (orderData) => {
      try {
        const response = await clientApi.post(clientUrl.order.create, orderData);
        return response;
      } catch (error) {
        console.error('Error creating order:', error);
        throw error;
      }
    },

    /**
     * Lấy danh sách đơn hàng
     * @param {number} page - Số trang (bắt đầu từ 0)
     * @param {number} size - Số lượng đơn hàng mỗi trang
     * @returns {Promise} - Promise chứa danh sách đơn hàng
     */
    getOrders: async (page = 0, size = 10) => {
      try {
        const response = await commonApi.get(commonUrl.order.getAll, {
          params: { page, size }
        });
        return response;
      } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
    },

    /**
     * Lấy chi tiết đơn hàng theo ID
     * @param {string} id - ID của đơn hàng
     * @returns {Promise} - Promise chứa thông tin chi tiết đơn hàng
     */
    getOrderById: async (id) => {
      try {
        const response = await commonApi.get(commonUrl.order.detail(id));
        return response;
      } catch (error) {
        console.error(`Error fetching order with ID ${id}:`, error);
        throw error;
      }
    },

    /**
     * Cập nhật trạng thái đơn hàng
     * @param {string} id - ID của đơn hàng
     * @param {string} status - Trạng thái mới
     * @returns {Promise} - Promise chứa kết quả cập nhật
     */
    updateOrderStatus: async (id, status) => {
      try {
        const response = await commonApi.put(commonUrl.order.updateStatus(id), { status });
        return response;
      } catch (error) {
        console.error(`Error updating order status for ID ${id}:`, error);
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
  },

  /**
   * API liên quan đến seller dashboard
   */
  seller: {
    /**
     * Lấy thống kê tổng quan cho seller dashboard
     * @param {string} sellerId - ID của seller
     * @returns {Promise} - Promise chứa thống kê tổng quan
     */
    getDashboardOverview: async (sellerId) => {
      try {
        const response = await clientApi.get(clientUrl.seller.dashboard.overview, {
          params: { sellerId }
        });
        return response;
      } catch (error) {
        console.error('Error fetching seller dashboard overview:', error);
        throw error;
      }
    },

    /**
     * Lấy danh sách sản phẩm của seller
     * @param {string} sellerId - ID của seller
     * @param {number} page - Số trang
     * @param {number} size - Số lượng sản phẩm mỗi trang
     * @returns {Promise} - Promise chứa danh sách sản phẩm
     */
    getProducts: async (sellerId, page = 0, size = 10) => {
      try {
        const response = await clientApi.get(clientUrl.seller.products, {
          params: { sellerId, page, size }
        });
        return response;
      } catch (error) {
        console.error('Error fetching seller products:', error);
        throw error;
      }
    },

    /**
     * Lấy danh sách đơn hàng của seller
     * @param {string} sellerId - ID của seller
     * @param {number} page - Số trang
     * @param {number} size - Số lượng đơn hàng mỗi trang
     * @returns {Promise} - Promise chứa danh sách đơn hàng
     */
    getOrders: async (sellerId, page = 0, size = 10) => {
      try {
        const response = await clientApi.get(clientUrl.seller.orders, {
          params: { sellerId, page, size }
        });
        return response;
      } catch (error) {
        console.error('Error fetching seller orders:', error);
        throw error;
      }
    },

    /**
     * Lấy hoạt động gần đây của seller
     * @param {string} sellerId - ID của seller
     * @param {number} limit - Số lượng hoạt động
     * @returns {Promise} - Promise chứa danh sách hoạt động
     */
    getActivities: async (sellerId, limit = 10) => {
      try {
        const response = await clientApi.get(clientUrl.seller.dashboard.activities, {
          params: { sellerId, limit }
        });
        return response;
      } catch (error) {
        console.error('Error fetching seller activities:', error);
        throw error;
      }
    }
  }
};

export default apiServices;