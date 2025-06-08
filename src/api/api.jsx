import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

// Định nghĩa endpoint paths theo tài liệu API
const ENDPOINTS = {
  ADMIN: `${BASE_URL}/admin`,
  CLIENT: `${BASE_URL}/client`,
  COMMON: `${BASE_URL}/common`,
};

// Khởi tạo instance axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Interceptor xử lý request - thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor xử lý response - trích xuất data từ response format chuẩn
api.interceptors.response.use(
  (response) => {
    // Trả về data từ format API: { code, message, data }
    if (response.data && response.data.code === "OK") {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    // Xử lý các lỗi phổ biến
    if (error.response) {
      // Lỗi từ server với status code
      const { status, data } = error.response;
      
      // Nếu token hết hạn hoặc không hợp lệ
      if (status === 401) {
        localStorage.removeItem("accessToken");
      }

      // Trả về message lỗi từ server nếu có
      return Promise.reject({
        status,
        message: data.message || "Lỗi từ server",
        data: data
      });
    } else if (error.request) {
      // Không nhận được response
      return Promise.reject({
        status: 0,
        message: "Không thể kết nối đến server",
      });
    } else {
      // Lỗi trong quá trình set up request
      return Promise.reject({
        message: error.message || "Có lỗi xảy ra",
      });
    }
  }
);

// Tạo function helper để gọi API
const createApiService = (baseURL) => ({
  get: (path, config) => api.get(`${baseURL}${path}`, config),
  post: (path, data, config) => api.post(`${baseURL}${path}`, data, config),
  put: (path, data, config) => api.put(`${baseURL}${path}`, data, config),
  delete: (path, config) => api.delete(`${baseURL}${path}`, config),
});

// Khởi tạo các service theo phân quyền từ tài liệu API
const adminApi = createApiService(ENDPOINTS.ADMIN);
const clientApi = createApiService(ENDPOINTS.CLIENT);
const commonApi = createApiService(ENDPOINTS.COMMON);

// Export default
export default {
  adminApi,
  clientApi,
  commonApi,
};
