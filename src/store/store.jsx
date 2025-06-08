import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './slices';

// Khởi tạo Redux store
const store = configureStore({
  reducer: {
    // Đặt tên auth cho slice để truy cập state.auth trong ứng dụng
    auth: authReducer,
    // Thêm các reducers khác ở đây, ví dụ:
    // cart: cartReducer,
    // product: productReducer,
  },
  // Cấu hình middleware - bỏ qua các actions và state chứa non-serializable values
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Bỏ qua các action types cụ thể
        ignoredActions: [
          'auth/loginCustomer/fulfilled',
          'auth/registerCustomer/fulfilled',
          'auth/fetchCurrentUser/fulfilled'
        ],
        // Bỏ qua các field paths trong tất cả các actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Bỏ qua các đường dẫn trong state
        ignoredPaths: ['auth.user'],
      },
    }),
  // Bật Redux DevTools trong môi trường phát triển
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
