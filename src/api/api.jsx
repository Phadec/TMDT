import axios from "axios";

import Code from "./code";

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
  headers: { "Content-Type": "application/json" },
});

// Tạo function helper để gọi API với token phù hợp
const createApiService = (baseURL, tokenKey = "accessToken") => {
  const instance = axios.create({
    baseURL,

    headers: { "Content-Type": "application/json" },
  });

  // Interceptor xử lý request - thêm token vào header
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(tokenKey);
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor xử lý response
  instance.interceptors.response.use(
    (response) => {
      // Nếu là upload file (FormData), trả về toàn bộ response
      if (
        response.config &&
        response.config.data &&
        typeof response.config.data === "object" &&
        (response.config.data instanceof FormData)
      ) {
        return response;
      }
      // Trả về data từ format API: { code, message, data }
      if (response.data && response.data.code === Code.OK) {
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
          localStorage.removeItem(tokenKey);
          // Redirect to login if it's admin token
          if (tokenKey === "adminToken") {
            window.location.href = "/admin/login";
          }
        }

        // Trả về message lỗi từ server nếu có
        return Promise.reject({
          status,
          message: data.message || "Lỗi từ server",
          data: data,
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

  return {
    get: (path, config) => instance.get(path, config),
    post: (path, data, config) => instance.post(path, data, config),
    put: (path, data, config) => instance.put(path, data, config),
    delete: (path, config) => instance.delete(path, config),
  };
};

// Khởi tạo các service theo phân quyền từ tài liệu API
const adminApi = createApiService(ENDPOINTS.ADMIN, "adminToken");
const clientApi = createApiService(ENDPOINTS.CLIENT, "accessToken");
const commonApi = createApiService(ENDPOINTS.COMMON, "accessToken");

// Export named exports
export { adminApi, clientApi, commonApi };
