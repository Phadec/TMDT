
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  loginCustomer, 
  registerCustomer, 
  logoutCustomer, 
  forgotPassword,
  clearAuthError,
  clearRegisterSuccess
} from '~/store/slices/authSlice';
import { PUBLIC_URL } from '~/path';

/**
 * Custom hook để sử dụng authentication trong ứng dụng
 * @returns {Object} Các methods và state liên quan đến authentication
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Lấy các state từ redux store
  const { 
    user, 
    isAuthenticated, 
    loading, 
    error, 
    registerSuccess 
  } = useSelector((state) => state.auth);



  /**
   * Đăng nhập người dùng
   * @param {Object} credentials - Thông tin đăng nhập (email, password)
   * @returns {Promise<boolean>} - True nếu đăng nhập thành công
   */
  const login = async (credentials) => {
    try {
      const resultAction = await dispatch(loginCustomer(credentials));
      if (loginCustomer.fulfilled.match(resultAction)) {
        navigate(PUBLIC_URL.HOME);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  /**
   * Đăng ký tài khoản mới
   * @param {Object} userData - Thông tin đăng ký
   * @returns {Promise<boolean>} - True nếu đăng ký thành công
   */
  const register = async (userData) => {
    try {
      const resultAction = await dispatch(registerCustomer(userData));
      if (registerCustomer.fulfilled.match(resultAction)) {
        // Có thể chuyển hướng tới trang đăng nhập sau khi đăng ký thành công
        // hoặc trang xác nhận email
        navigate(PUBLIC_URL.LOGIN);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  /**
   * Đăng xuất người dùng
   * @returns {Promise<boolean>} - True nếu đăng xuất thành công
   */
  const logout = async () => {
    try {
      await dispatch(logoutCustomer());
      navigate(PUBLIC_URL.LOGIN);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  };

  /**
   * Yêu cầu khôi phục mật khẩu
   * @param {string} email - Email người dùng
   * @returns {Promise<boolean>} - True nếu yêu cầu thành công
   */
  const forgotPasswordRequest = async (email) => {
    try {
      const resultAction = await dispatch(forgotPassword(email));
      return forgotPassword.fulfilled.match(resultAction);
    } catch (error) {
      console.error('Forgot password error:', error);
      return false;
    }
  };

  /**
   * Xóa lỗi xác thực
   */
  const clearErrors = () => {
    dispatch(clearAuthError());
  };

  /**
   * Xóa trạng thái đăng ký thành công
   */
  const clearRegisterState = () => {
    dispatch(clearRegisterSuccess());
  };

  // Trả về các state và functions để sử dụng trong component
  return {
    // State
    user,
    isAuthenticated,
    loading,
    error,
    registerSuccess,
    
    // Actions
    login,
    register,
    logout,
    forgotPasswordRequest,
    clearErrors,
    clearRegisterState
  };
};

export default useAuth;