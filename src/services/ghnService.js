import axios from 'axios';

const GHN_BASE_URL = 'https://online-gateway.ghn.vn/shiip/public-api/master-data';
const GHN_SHIPPING_URL = 'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order';

// Tạo axios instance cho GHN API
const ghnApi = axios.create({
  baseURL: GHN_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'token': import.meta.env.VITE_GHN_API_TOKEN
  },
});

// Tạo axios instance cho GHN Shipping API
const ghnShippingApi = axios.create({
  baseURL: GHN_SHIPPING_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'token': import.meta.env.VITE_GHN_API_TOKEN
  },
});

// Interceptor để xử lý response cho master data API
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

// Interceptor để xử lý response cho shipping API
ghnShippingApi.interceptors.response.use(
  (response) => {
    // Trả về data nếu API thành công
    if (response.data && response.data.code === 200) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    console.error('GHN Shipping API Error:', error);
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
  },

  // Lấy danh sách dịch vụ vận chuyển có sẵn
  getAvailableServices: async (fromDistrict, toDistrict) => {
    try {
      const response = await ghnShippingApi.get('/available-services', {
        params: {
          shop_id: 5802790, // Shop ID đã test thành công
          from_district: fromDistrict,
          to_district: toDistrict
        }
      });
      return response;
    } catch (error) {
      console.error('Error getting available services:', error);
      throw error;
    }
  },

  // Parse địa chỉ và lấy district_id, ward_code từ GHN
  parseAddressToGHNIds: async (addressString) => {
    try {
      if (!addressString) return null;
      
      // Tách địa chỉ theo dấu phẩy
      const parts = addressString.split(',').map(part => part.trim());
      
      if (parts.length < 3) return null;
      
      // Lấy tỉnh (phần cuối cùng)
      const provinceName = parts[parts.length - 1];
      
      // Lấy quận/huyện (phần thứ 2 từ cuối)
      const districtName = parts[parts.length - 2];
      
      // Lấy phường/xã (phần thứ 3 từ cuối)
      const wardName = parts[parts.length - 3];
    
      
      // Lấy danh sách tỉnh
      const provinces = await ghnService.getProvinces();
      
      // Tìm province ID từ tên
      const province = provinces.find(p => 
        p.ProvinceName.toLowerCase().includes(provinceName.toLowerCase()) ||
        provinceName.toLowerCase().includes(p.ProvinceName.toLowerCase())
      );
      
      if (!province) {
        console.error('Không tìm thấy tỉnh:', provinceName);
        return null;
      }

      // Lấy danh sách quận/huyện
      const districts = await ghnService.getDistricts(province.ProvinceID);
      
      // Tìm district ID
      const district = districts.find(d => 
        d.DistrictName.toLowerCase().includes(districtName.toLowerCase()) ||
        districtName.toLowerCase().includes(d.DistrictName.toLowerCase())
      );
      
      if (!district) {
        console.error('Không tìm thấy quận/huyện:', districtName);
        return null;
      }

      // Lấy danh sách phường/xã
      const wards = await ghnService.getWards(district.DistrictID);
      
      // Tìm ward code
      const ward = wards.find(w => 
        w.WardName.toLowerCase().includes(wardName.toLowerCase()) ||
        wardName.toLowerCase().includes(w.WardName.toLowerCase())
      );
      
      if (!ward) {
        console.error('Không tìm thấy phường/xã:', wardName);
        return null;
      }

      return {
        provinceName: province.ProvinceName,
        districtName: district.DistrictName,
        wardName: ward.WardName,
        provinceId: province.ProvinceID.toString(),
        districtId: district.DistrictID.toString(),
        wardCode: ward.WardCode
      };
      
    } catch (error) {
      console.error('Error parsing address to GHN IDs:', error);
      return null;
    }
  },

  // Tính phí vận chuyển
  calculateShippingFee: async (shippingData) => {
    try {
      
      // Bước 1: Lấy service_id từ available-services
      const availableServicesResponse = await ghnShippingApi.get('/available-services', {
        params: {
          shop_id: 5802790, // Shop ID đã test thành công
          from_district: shippingData.from_district_id,
          to_district: shippingData.to_district_id
        }
      });
      
      const availableServices = availableServicesResponse;
      
      // Tìm service "Hàng nhẹ" (có thể có encoding khác nhau)
      const lightService = availableServices.find(service => 
        service.short_name === "Hàng nhẹ" || 
        service.short_name.includes("nhẹ") ||
        service.service_id === 53321 // Fallback với service_id cố định
      );
      
      if (!lightService) {
        console.warn('Không tìm thấy dịch vụ "Hàng nhẹ", sử dụng service đầu tiên');
        // Fallback: sử dụng service đầu tiên nếu không tìm thấy "Hàng nhẹ"
        const firstService = availableServices[0];
        if (!firstService) {
          throw new Error('Không có dịch vụ vận chuyển nào khả dụng');
        }
        
        // Sử dụng service đầu tiên
        const response = await ghnShippingApi.post('/fee', {
          service_id: firstService.service_id,
          insurance_value: shippingData.insurance_value,
          from_district_id: shippingData.from_district_id,
          from_ward_code: shippingData.from_ward_code,
          service_type_id: firstService.service_type_id,
          to_district_id: shippingData.to_district_id,
          to_ward_code: shippingData.to_ward_code,
          height: shippingData.height || 50,
          length: shippingData.length || 20,
          weight: shippingData.weight || 200,
          width: shippingData.width || 20,
        });
        return response;
      }

      // Bước 2: Tính phí với service_id đúng
      const response = await ghnShippingApi.post('/fee', {
        service_id: lightService.service_id,
        insurance_value: shippingData.insurance_value,
        from_district_id: shippingData.from_district_id,
        from_ward_code: shippingData.from_ward_code,
        service_type_id: lightService.service_type_id,
        to_district_id: shippingData.to_district_id,
        to_ward_code: shippingData.to_ward_code,
        height: shippingData.height || 50,
        length: shippingData.length || 20,
        weight: shippingData.weight || 200,
        width: shippingData.width || 20,
      });
      return response;
    } catch (error) {
      console.error('Error calculating shipping fee:', error);
      throw error;
    }
  }
};