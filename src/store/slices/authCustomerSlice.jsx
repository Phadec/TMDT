import Swal from "sweetalert2";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { commonApi, clientApi, clientUrl, commonUrl } from "~/api";

// Async thunks for authentication
export const loginCustomer = createAsyncThunk(
  "auth/loginCustomer",
  async (credentials, { rejectWithValue }) => {
    try {
      // Sử dụng endpoint client auth login theo tài liệu API
      const response = await clientApi.post(clientUrl.auth.login, credentials);

      // Lưu token vào localStorage
      if (response && response.token) {
        localStorage.setItem("accessToken", response.token);
      }

      // Sau khi đăng nhập thành công, lấy thông tin profile đầy đủ
      if (response && response.id) {
        try {
          const profileResponse = await clientApi.post("/profile/view", {
            personId: response.id,
          });

          // Kết hợp dữ liệu từ login response và profile response
          const fullUserData = {
            ...response,
            fullname: profileResponse?.data?.fullName || profileResponse?.fullName || response.fullname,
            phone: profileResponse?.data?.phone || profileResponse?.phone || response.phone,
            address: profileResponse?.data?.addresses || profileResponse?.addresses || null,
            name: profileResponse?.data?.name || profileResponse?.name || response.name,
          };

          return fullUserData;
        } catch (profileError) {
          console.warn("Không thể lấy thông tin profile:", profileError);
          // Vẫn trả về response gốc nếu không lấy được profile
          return response;
        }
      }

      return response;
    } catch (error) {
      // Only return serializable error data
      const errorMessage = error?.message || error?.data?.message || "Đăng nhập thất bại";
      const errorStatus = error?.status || 500;
      
      return rejectWithValue({
        message: errorMessage,
        status: errorStatus,
      });
    }
  }
);

export const registerCustomer = createAsyncThunk(
  "auth/registerCustomer",
  async (userData, { rejectWithValue }) => {
    try {
      // Sử dụng endpoint client auth register theo tài liệu API
      const response = await clientApi.post(clientUrl.auth.register, userData);
      return response;
    } catch (error) {
      // Only return serializable error data
      const errorMessage = error?.message || error?.data?.message || "Đăng ký thất bại";
      const errorStatus = error?.status || 500;
      
      return rejectWithValue({
        message: errorMessage,
        status: errorStatus,
      });
    }
  }
);

export const logoutCustomer = createAsyncThunk(
  "auth/logoutCustomer",
  async (customerId, { rejectWithValue }) => {
    try {
      // Sử dụng endpoint common auth logout theo tài liệu API
      const response = await commonApi.post(commonUrl.auth.logout, {
        personId: customerId,
      });
      // Xóa token từ localStorage
      localStorage.removeItem("accessToken");
      return response;
    } catch (error) {
      // Vẫn xóa token dù API có lỗi
      localStorage.removeItem("accessToken");
      
      // Only return serializable error data
      const errorMessage = error?.message || error?.data?.message || "Đăng xuất thất bại";
      const errorStatus = error?.status || 500;
      
      return rejectWithValue({
        message: errorMessage,
        status: errorStatus,
      });
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      // Sử dụng endpoint common auth forgot theo tài liệu API
      const response = await clientApi.put(clientUrl.auth.forget, { email });
      return response;
    } catch (error) {
      // Only return serializable error data
      const errorMessage = error?.message || error?.data?.message || "Gửi email thất bại";
      const errorStatus = error?.status || 500;
      
      return rejectWithValue({
        message: errorMessage,
        status: errorStatus,
      });
    }
  }
);

// Hàm helper để lấy user data từ localStorage
const getUserFromStorage = () => {
  try {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    return null;
  }
};

// Trạng thái ban đầu của auth
const initialState = {
  user: getUserFromStorage(),
  token: localStorage.getItem("accessToken") || null,
  isAuthenticated: !!localStorage.getItem("accessToken"),
  loading: false,
  error: null,
  registerSuccess: false,
};

const authCustomerSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    clearRegisterSuccess: (state) => {
      state.registerSuccess = false;
    },
    updateUserData: (state, action) => {
      // Cập nhật thông tin user trong state và localStorage
      const updatedUser = {
        ...state.user,
        ...action.payload,
      };
      state.user = updatedUser;
      
      // Cập nhật localStorage
      localStorage.setItem("userData", JSON.stringify(updatedUser));
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(loginCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload;

        // Lưu user data vào localStorage
        localStorage.setItem("userData", JSON.stringify(action.payload));

        Swal.fire({
          icon: "success",
          title: "Đăng nhập thành công!",
          text: "Chào mừng bạn quay trở lại Chợ Việt",
          timer: 2000,
          showConfirmButton: false,
        });
      })
      .addCase(loginCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;

        Swal.fire({
          icon: "error",
          title: "Đăng nhập thất bại",
          text:
            action.payload?.message ||
            "Vui lòng kiểm tra lại thông tin đăng nhập",
        });
      });

    // Register cases
    builder
      .addCase(registerCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registerSuccess = false;
      })
      .addCase(registerCustomer.fulfilled, (state) => {
        state.loading = false;
        state.registerSuccess = true;

        Swal.fire({
          icon: "success",
          title: "Đăng ký thành công!",
          text: "Chào mừng bạn tới Chợ Việt 🫂",
          timer: 3000,
          showConfirmButton: false,
        });
      })
      .addCase(registerCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.registerSuccess = false;

        Swal.fire({
          icon: "error",
          title: "Đăng ký thất bại",
          text:
            action.payload?.message ||
            "Vui lòng kiểm tra lại thông tin đăng ký",
        });
      });

    // Logout cases
    builder
      .addCase(logoutCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutCustomer.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;

        // Xóa userData khỏi localStorage
        localStorage.removeItem("userData");

        Swal.fire({
          icon: "success",
          title: "Đăng xuất thành công!",
          text: "Hẹn gặp lại bạn tại Chợ Việt",
          timer: 1000,
          showConfirmButton: false,
        });
      })
      .addCase(logoutCustomer.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;

        // Xóa userData khỏi localStorage ngay cả khi logout thất bại
        localStorage.removeItem("userData");
      });

    // Forgot password cases
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;

        Swal.fire({
          icon: "success",
          title: "Yêu cầu đã được gửi!",
          text: "Vui lòng kiểm tra email để lấy lại mật khẩu",
          timer: 3000,
          showConfirmButton: false,
        });
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;

        Swal.fire({
          icon: "error",
          title: "Yêu cầu thất bại",
          text:
            action.payload?.message ||
            "Không thể gửi yêu cầu khôi phục mật khẩu",
        });
      });
  },
});

export const { clearAuthError, clearRegisterSuccess, updateUserData } =
  authCustomerSlice.actions;
export default authCustomerSlice.reducer;
