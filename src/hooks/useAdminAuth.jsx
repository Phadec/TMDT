import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  loginAdmin, 
  logoutAdmin,
  clearAuthError
} from '~/store/slices/authAdminSlice';
import { ADMIN_URL } from '~/path';

/**
 * Custom hook để sử dụng admin authentication trong ứng dụng
 * @returns {Object} Các methods và state liên quan đến admin authentication
 */
export const useAdminAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Lấy các state từ redux store
  const { 
    admin, 
    isAuthenticated, 
    loading, 
    error,
    token
  } = useSelector((state) => state.authAdmin);

  /**
   * Đăng nhập admin
   * @param {Object} credentials - Thông tin đăng nhập (email, password)
   * @param {string} redirectTo - Đường dẫn chuyển hướng sau khi đăng nhập thành công
   * @returns {Promise<boolean>} - True nếu đăng nhập thành công
   */
  const login = async (credentials, redirectTo = ADMIN_URL.DASHBOARD) => {
    try {
      const resultAction = await dispatch(loginAdmin(credentials));
      if (loginAdmin.fulfilled.match(resultAction)) {
        navigate(redirectTo);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  /**
   * Đăng xuất admin
   * @returns {Promise<boolean>} - True nếu đăng xuất thành công
   */
  const logout = async () => {
    try {
      // Lấy adminId từ thông tin admin hiện tại
      const adminId = admin?.id || admin?.adminId || admin?.personId;

      const resultAction = await dispatch(logoutAdmin(adminId));
      if(logoutAdmin.fulfilled.match(resultAction)) {
        // Chuyển hướng về trang đăng nhập admin sau khi đăng xuất
        localStorage.removeItem('adminToken'); // Xóa token khỏi localStorage
        localStorage.removeItem('adminData'); // Xóa admin data khỏi localStorage
        navigate(ADMIN_URL.LOGIN);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Admin logout error:', error);
      // Vẫn xóa dữ liệu local và chuyển hướng ngay cả khi API call thất bại
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      navigate(ADMIN_URL.LOGIN);
      return false;
    }
  };

  /**
   * Xóa lỗi xác thực
   */
  const clearErrors = () => {
    dispatch(clearAuthError());
  };

  // Trả về các state và functions để sử dụng trong component
  return {
    // State
    admin,
    user: admin, // Alias để tương thích với useAuth
    isAuthenticated,
    loading,
    error,
    token,
    
    // Actions
    login,
    logout,
    clearErrors
  };
};

export default useAdminAuth;