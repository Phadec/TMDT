import { adminApi, commonApi } from './api';
import { adminUrl, commonUrl } from './endpoint';

/**
 * Admin API Services
 * Tập hợp các hàm gọi API dành cho admin
 */
const adminServices = {
  /**
   * Authentication APIs
   */
  auth: {
    /**
     * Đăng nhập admin
     */
    login: async (credentials) => {
      try {
        const response = await adminApi.post(adminUrl.auth.login, credentials);
        return response;
      } catch (error) {
        console.error('Admin login error:', error);
        throw error;
      }
    },

    /**
     * Đăng ký admin
     */
    register: async (userData) => {
      try {
        const response = await adminApi.post(adminUrl.auth.register, userData);
        return response;
      } catch (error) {
        console.error('Admin register error:', error);
        throw error;
      }
    },

    /**
     * Đăng xuất admin
     */
    logout: async (adminId) => {
      try {
        const response = await commonApi.post(commonUrl.auth.logout, {
          personId: adminId,
        });
        return response;
      } catch (error) {
        console.error('Admin logout error:', error);
        throw error;
      }
    }
  },

  /**
   * User Management APIs
   */
  users: {
    /**
     * Lấy danh sách tất cả người dùng với phân trang
     */
    getAll: async (page = 0, size = 10) => {
      try {
        const response = await adminApi.get(`${adminUrl.user.getAll}?page=${page}&size=${size}`);
        return response;
      } catch (error) {
        console.error('Get users error:', error);
        throw error;
      }
    },

    /**
     * Lấy thông tin chi tiết người dùng
     */
    getById: async (userId) => {
      try {
        const response = await adminApi.get(adminUrl.user.detail(userId));
        return response;
      } catch (error) {
        console.error('Get user by ID error:', error);
        throw error;
      }
    },

    /**
     * Cập nhật trạng thái người dùng
     */
    updateStatus: async (userId, status) => {
      try {
        const response = await adminApi.put(adminUrl.user.updateStatus(userId), { status });
        return response;
      } catch (error) {
        console.error('Update user status error:', error);
        throw error;
      }
    },

    /**
     * Xóa người dùng
     */
    delete: async (userId) => {
      try {
        const response = await adminApi.delete(adminUrl.user.delete(userId));
        return response;
      } catch (error) {
        console.error('Delete user error:', error);
        throw error;
      }
    }
  },

  /**
   * Customer Management APIs
   */
  customers: {
    /**
     * Lấy danh sách tất cả khách hàng với phân trang
     */
    getAll: async (page = 0, size = 10) => {
      try {
        const response = await adminApi.get(`${adminUrl.customer.getAll}?page=${page}&size=${size}`);
        return response;
      } catch (error) {
        console.error('Get customers error:', error);
        throw error;
      }
    },

    /**
     * Lấy thông tin chi tiết khách hàng
     */
    getById: async (customerId) => {
      try {
        const response = await adminApi.get(adminUrl.customer.detail(customerId));
        return response;
      } catch (error) {
        console.error('Get customer by ID error:', error);
        throw error;
      }
    },

    /**
     * Cập nhật trạng thái khách hàng
     */
    updateStatus: async (customerId, status) => {
      try {
        const response = await adminApi.put(adminUrl.customer.updateStatus(customerId), { status });
        return response;
      } catch (error) {
        console.error('Update customer status error:', error);
        throw error;
      }
    },

    /**
     * Xóa khách hàng
     */
    delete: async (customerId) => {
      try {
        const response = await adminApi.delete(adminUrl.customer.delete(customerId));
        return response;
      } catch (error) {
        console.error('Delete customer error:', error);
        throw error;
      }
    },

    /**
     * Đăng ký khách hàng thành người bán
     */
    registerAsSeller: async (customerId) => {
      try {
        const response = await adminApi.put(adminUrl.customer.registerAsSeller(customerId));
        return response;
      } catch (error) {
        console.error('Register customer as seller error:', error);
        throw error;
      }
    }
  },

  /**
   * Product Management APIs
   */
  products: {
    /**
     * Lấy danh sách tất cả sản phẩm với phân trang
     */
    getAll: async (page = 0, size = 10) => {
      try {
        const response = await adminApi.get(`${adminUrl.product.getAll}?page=${page}&size=${size}`);
        return response;
      } catch (error) {
        console.error('Get products error:', error);
        throw error;
      }
    },

    /**
     * Tạo sản phẩm mới
     */
    create: async (productData) => {
      try {
        const response = await adminApi.post(adminUrl.product.create, productData);
        return response;
      } catch (error) {
        console.error('Create product error:', error);
        throw error;
      }
    },

    /**
     * Tạo nhiều sản phẩm
     */
    createMany: async (productsData) => {
      try {
        const response = await adminApi.post(adminUrl.product.createMany, productsData);
        return response;
      } catch (error) {
        console.error('Create many products error:', error);
        throw error;
      }
    },

    /**
     * Cập nhật sản phẩm
     */
    update: async (productId, productData) => {
      try {
        const response = await adminApi.put(adminUrl.product.update(productId), productData);
        return response;
      } catch (error) {
        console.error('Update product error:', error);
        throw error;
      }
    },

    /**
     * Xóa sản phẩm
     */
    delete: async (productId) => {
      try {
        const response = await adminApi.delete(adminUrl.product.delete(productId));
        return response;
      } catch (error) {
        console.error('Delete product error:', error);
        throw error;
      }
    }
  },

  /**
   * Order Management APIs
   */
  orders: {
    /**
     * Lấy danh sách tất cả đơn hàng với phân trang
     */
    getAll: async (page = 0, size = 10) => {
      try {
        const response = await adminApi.get(`${adminUrl.order.getAll}?page=${page}&size=${size}`);
        return response;
      } catch (error) {
        console.error('Get orders error:', error);
        throw error;
      }
    },

    /**
     * Lấy đơn hàng theo trạng thái
     */
    getByStatus: async (status, page = 0, size = 10) => {
      try {
        const response = await adminApi.get(`${adminUrl.order.getByStatus}?page=${page}&size=${size}`, {
          data: { status }
        });
        return response;
      } catch (error) {
        console.error('Get orders by status error:', error);
        throw error;
      }
    },

    /**
     * Lấy thông tin chi tiết đơn hàng
     */
    getById: async (orderId) => {
      try {
        const response = await adminApi.get(adminUrl.order.detail(orderId));
        return response;
      } catch (error) {
        console.error('Get order by ID error:', error);
        throw error;
      }
    },

    /**
     * Cập nhật trạng thái đơn hàng
     */
    updateStatus: async (orderId, status) => {
      try {
        const response = await adminApi.put(adminUrl.order.updateStatus, {
          orderId,
          status
        });
        return response;
      } catch (error) {
        console.error('Update order status error:', error);
        throw error;
      }
    }
  },

  /**
   * Redis Management APIs
   */
  redis: {
    /**
     * Lấy thông tin Redis
     */
    getInfo: async () => {
      try {
        const response = await adminApi.get('/redis/info');
        return response;
      } catch (error) {
        console.error('Get Redis info error:', error);
        throw error;
      }
    },

    /**
     * Tìm kiếm keys
     */
    searchKeys: async (pattern = '*', page = 0, size = 20) => {
      try {
        const response = await adminApi.get(`/redis/keys?pattern=${pattern}&page=${page}&size=${size}`);
        return response;
      } catch (error) {
        console.error('Search Redis keys error:', error);
        throw error;
      }
    },

    /**
     * Lấy thông tin key
     */
    getKeyInfo: async (key) => {
      try {
        const response = await adminApi.get(`/redis/key/${encodeURIComponent(key)}`);
        return response;
      } catch (error) {
        console.error('Get Redis key info error:', error);
        throw error;
      }
    },

    /**
     * Xóa key
     */
    deleteKey: async (key) => {
      try {
        const response = await adminApi.delete(`/redis/key/${encodeURIComponent(key)}`);
        return response;
      } catch (error) {
        console.error('Delete Redis key error:', error);
        throw error;
      }
    },

    /**
     * Set value cho key
     */
    setValue: async (key, value, timeout = null, unit = 'SECONDS') => {
      try {
        const data = { value };
        if (timeout) {
          data.timeout = timeout;
          data.unit = unit;
        }
        const response = await adminApi.put(`/redis/key/${encodeURIComponent(key)}`, data);
        return response;
      } catch (error) {
        console.error('Set Redis key value error:', error);
        throw error;
      }
    },

    /**
     * Flush tất cả keys
     */
    flushAll: async () => {
      try {
        const response = await adminApi.delete('/redis/flush');
        return response;
      } catch (error) {
        console.error('Flush Redis error:', error);
        throw error;
      }
    }
  },

  /**
   * Image Proxy APIs
   */
  imageProxy: {
    /**
     * Lấy ảnh thông qua proxy
     */
    getImage: async (imageUrl) => {
      try {
        const encodedUrl = encodeURIComponent(imageUrl);
        const response = await commonApi.get(`/image-proxy/image?url=${encodedUrl}`, {
          responseType: 'blob'
        });
        return response;
      } catch (error) {
        console.error('Get image via proxy error:', error);
        throw error;
      }
    }
  },

  /**
   * Categories Management APIs
   */
  categories: {
    /**
     * Lấy tất cả danh mục
     */
    getAll: async () => {
      try {
        const response = await adminApi.get('/categories');
        return response;
      } catch (error) {
        console.error('Get all categories error:', error);
        throw error;
      }
    },

    /**
     * Lấy danh mục gốc
     */
    getParents: async () => {
      try {
        const response = await adminApi.get('/categories/parents');
        return response;
      } catch (error) {
        console.error('Get parent categories error:', error);
        throw error;
      }
    },

    /**
     * Lấy danh mục con theo parentId
     */
    getChildren: async (parentId) => {
      try {
        const response = await adminApi.get(`/categories/children/${parentId}`);
        return response;
      } catch (error) {
        console.error('Get child categories error:', error);
        throw error;
      }
    },

    /**
     * Lấy danh mục theo ID
     */
    getById: async (id) => {
      try {
        const response = await adminApi.get(`/categories/${id}`);
        return response;
      } catch (error) {
        console.error('Get category by id error:', error);
        throw error;
      }
    },

    /**
     * Tạo danh mục mới
     */
    create: async (categoryData) => {
      try {
        const response = await adminApi.post('/categories', categoryData);
        return response;
      } catch (error) {
        console.error('Create category error:', error);
        throw error;
      }
    },

    /**
     * Cập nhật danh mục
     */
    update: async (id, categoryData) => {
      try {
        const response = await adminApi.put(`/categories/${id}`, categoryData);
        return response;
      } catch (error) {
        console.error('Update category error:', error);
        throw error;
      }
    },

    /**
     * Xóa danh mục
     */
    delete: async (id) => {
      try {
        const response = await adminApi.delete(`/categories/${id}`);
        return response;
      } catch (error) {
        console.error('Delete category error:', error);
        throw error;
      }
    },

    /**
     * Tìm kiếm danh mục theo tên
     */
    search: async (keyword) => {
      try {
        const response = await adminApi.get(`/categories/search?keyword=${encodeURIComponent(keyword)}`);
        return response;
      } catch (error) {
        console.error('Search categories error:', error);
        throw error;
      }
    },

    /**
     * Lấy danh mục theo trạng thái
     */
    getByStatus: async (isActive) => {
      try {
        const response = await adminApi.get(`/categories/status/${isActive}`);
        return response;
      } catch (error) {
        console.error('Get categories by status error:', error);
        throw error;
      }
    }
  }
};

export { adminServices };
export default adminServices;
