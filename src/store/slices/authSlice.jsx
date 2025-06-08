import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '~/api/api';
import Swal from 'sweetalert2';

// Async thunks for authentication
export const loginCustomer = createAsyncThunk(
  'auth/loginCustomer',
  async (credentials, { rejectWithValue }) => {
    try {
      // Sử dụng endpoint client auth login theo tài liệu API
      const response = await api.clientApi.post('/auth/login', credentials);
      
      // Lưu token vào localStorage
      if (response && response.token) {
        localStorage.setItem('accessToken', response.token);
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const registerCustomer = createAsyncThunk(
  'auth/registerCustomer',
  async (userData, { rejectWithValue }) => {
    try {
      // Sử dụng endpoint client auth register theo tài liệu API
      const response = await api.clientApi.post('/auth/register', userData);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      // Lấy thông tin người dùng hiện tại (giả định endpoint là /profile)
      const response = await api.clientApi.get('/profile');
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const logoutCustomer = createAsyncThunk(
  'auth/logoutCustomer',
  async (_, { rejectWithValue }) => {
    try {
      // Sử dụng endpoint common auth logout theo tài liệu API
      await api.commonApi.post('/auth/logout');
      // Xóa token từ localStorage
      localStorage.removeItem('accessToken');
      return { success: true };
    } catch (error) {
      // Vẫn xóa token dù API có lỗi
      localStorage.removeItem('accessToken');
      return rejectWithValue(error);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      // Sử dụng endpoint common auth forgot theo tài liệu API
      const response = await api.commonApi.put('/auth/forgot', { email });
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      // Sử dụng endpoint common auth change theo tài liệu API
      const response = await api.commonApi.put('/auth/change', passwordData);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Trạng thái ban đầu của auth
const initialState = {
  user: null,
  token: localStorage.getItem('accessToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,
  registerSuccess: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    clearRegisterSuccess: (state) => {
      state.registerSuccess = false;
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
        state.user = action.payload.user;
        
        Swal.fire({
          icon: 'success',
          title: 'Đăng nhập thành công!',
          text: 'Chào mừng bạn quay trở lại Chợ Việt',
          timer: 2000,
          showConfirmButton: false
        });
      })
      .addCase(loginCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        
        Swal.fire({
          icon: 'error',
          title: 'Đăng nhập thất bại',
          text: action.payload?.message || 'Vui lòng kiểm tra lại thông tin đăng nhập',
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
          icon: 'success',
          title: 'Đăng ký thành công!',
          text: 'Vui lòng kiểm tra email để xác nhận tài khoản',
          timer: 3000,
          showConfirmButton: false
        });
      })
      .addCase(registerCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.registerSuccess = false;
        
        Swal.fire({
          icon: 'error',
          title: 'Đăng ký thất bại',
          text: action.payload?.message || 'Vui lòng kiểm tra lại thông tin đăng ký',
        });
      });

    // Fetch current user cases
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        
        // If unauthorized, clear auth state
        if (action.payload?.status === 401) {
          state.isAuthenticated = false;
          state.token = null;
          state.user = null;
        }
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
        
        Swal.fire({
          icon: 'success',
          title: 'Đăng xuất thành công!',
          text: 'Hẹn gặp lại bạn tại Chợ Việt',
          timer: 2000,
          showConfirmButton: false
        });
      })
      .addCase(logoutCustomer.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
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
          icon: 'success',
          title: 'Yêu cầu đã được gửi!',
          text: 'Vui lòng kiểm tra email để lấy lại mật khẩu',
          timer: 3000,
          showConfirmButton: false
        });
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        
        Swal.fire({
          icon: 'error',
          title: 'Yêu cầu thất bại',
          text: action.payload?.message || 'Không thể gửi yêu cầu khôi phục mật khẩu',
        });
      });

    // Change password cases
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        
        Swal.fire({
          icon: 'success',
          title: 'Đổi mật khẩu thành công!',
          text: 'Mật khẩu của bạn đã được cập nhật',
          timer: 2000,
          showConfirmButton: false
        });
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        
        Swal.fire({
          icon: 'error',
          title: 'Đổi mật khẩu thất bại',
          text: action.payload?.message || 'Không thể đổi mật khẩu, vui lòng thử lại',
        });
      });
  },
});

export const { clearAuthError, clearRegisterSuccess } = authSlice.actions;
export default authSlice.reducer;