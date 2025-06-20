import Swal from "sweetalert2";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { adminApi, commonApi, adminUrl, commonUrl } from "~/api";

// Async thunk for admin login - accept navigate function as parameter
export const loginAdmin = createAsyncThunk(
  "authAdmin/loginAdmin",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await adminApi.post(adminUrl.auth.login, credentials);

      if (response && response.token) {
        localStorage.setItem("adminToken", response.token);
      }

      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const logoutAdmin = createAsyncThunk(
  "authAdmin/logoutAdmin",
  async (adminId, { rejectWithValue }) => {
    try {
      const response = await commonApi.post(commonUrl.auth.logout, {
        personId: adminId,
      });
      localStorage.removeItem("adminToken");
      return response;
    } catch (error) {
      localStorage.removeItem("adminToken");
      return rejectWithValue(error);
    }
  }
);

const getAdminFromStorage = () => {
  try {
    const adminData = localStorage.getItem("adminData");
    return adminData ? JSON.parse(adminData) : null;
  } catch (error) {
    console.error("Error parsing admin data from localStorage:", error);
    return null;
  }
};

const initialState = {
  admin: getAdminFromStorage(),
  token: localStorage.getItem("adminToken") || null,
  isAuthenticated: !!localStorage.getItem("adminToken"),
  loading: false,
  error: null,
};

const authAdminSlice = createSlice({
  name: "authAdmin",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.admin = action.payload;

        // Debug log
        console.log('Admin login response:', action.payload);

        localStorage.setItem("adminData", JSON.stringify(action.payload));

        Swal.fire({
          icon: "success",
          title: "Đăng nhập thành công!",
          text: "Chào mừng Admin quay trở lại",
          timer: 2000,
          showConfirmButton: false,
        });
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;

        Swal.fire({
          icon: "error",
          title: "Đăng nhập thất bại",
          text:
            action.payload?.message ||
            "Vui lòng kiểm tra lại thông tin đăng nhập",
        });
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.admin = null;

        localStorage.removeItem("adminData");

        Swal.fire({
          icon: "success",
          title: "Đăng xuất thành công!",
          timer: 1000,
          showConfirmButton: false,
        });
      })
      .addCase(logoutAdmin.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.admin = null;

        localStorage.removeItem("adminData");
      });
  },
});

export const { clearAuthError } = authAdminSlice.actions;
export default authAdminSlice.reducer;
