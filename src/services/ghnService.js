import axios from 'axios';

const GHN_BASE_URL = 'https://online-gateway.ghn.vn/shiip/public-api/master-data';

// Tạo axios instance cho GHN API
const ghnApi = axios.create({
  baseURL: GHN_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Token': import.meta.env.VITE_GHN_API_TOKEN
  },
});

// Interceptor để xử lý response
ghnApi.interceptors.response.use(
  (response) => {
    // Trả về data nếu API thành công
    if (response.data && response.data.code === 200) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    console.error('GHN API Error:', error);
    return Promise.reject(error);
  }
);

// Service functions
export const ghnService = {
  // Lấy danh sách tỉnh/thành phố
  getProvinces: async () => {
    try {
      const response = await ghnApi.get('/province');
      return response;
    } catch (error) {
      console.error('Error fetching provinces:', error);
      throw error;
    }
  },

  // Lấy danh sách quận/huyện theo tỉnh
  getDistricts: async (provinceId) => {
    try {
      const response = await ghnApi.post('/district', {
        province_id: parseInt(provinceId)
      });
      return response;
    } catch (error) {
      console.error('Error fetching districts:', error);
      throw error;
    }
  },

  // Lấy danh sách phường/xã theo quận/huyện
  getWards: async (districtId) => {
    try {
      const response = await ghnApi.post('/ward', {
        district_id: parseInt(districtId)
      });
      return response;
    } catch (error) {
      console.error('Error fetching wards:', error);
      throw error;
    }
  }
};