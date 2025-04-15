import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  const refreshToken = async () => {
    try {
      const oldToken = localStorage.getItem('token');
      if (!oldToken) {
        throw new Error('No token to refresh');
      }

      // Đảm bảo header Authorization được set trước khi gọi refresh
      if (api.defaults) {
        api.defaults.headers.common['Authorization'] = `Bearer ${oldToken}`;
      } else if (api.axios) {
        // If api is a custom wrapper around axios
        api.axios.defaults.headers.common['Authorization'] = `Bearer ${oldToken}`;
      }
      
      // Fix the API call depending on how api is structured
      let response;
      if (typeof api.post === 'function') {
        // Direct axios instance
        response = await api.post('/api/v1/auth/refresh-token');
      } else if (api.axios && typeof api.axios.post === 'function') {
        // Custom wrapper around axios
        response = await api.axios.post('/api/v1/auth/refresh-token');
      } else if (typeof api === 'function') {
        // If api is a function itself
        response = await api('/api/v1/auth/refresh-token', {
          method: 'POST'
        });
      } else {
        throw new Error('API client is not configured properly');
      }
      
      const { token, user } = response.data;

      if (token && isTokenValid(token)) {
        localStorage.setItem('token', token);
        
        // Update headers based on API structure
        if (api.defaults) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else if (api.axios) {
          api.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        // Cập nhật thông tin user nếu có
        if (user) {
          setCurrentUser(user);
        }
        
        return token;
      }
      
      throw new Error('Invalid token received from refresh');
    } catch (error) {
      console.error('Error refreshing token:', error);
      
      // Xóa token và thông tin người dùng
      localStorage.removeItem('token');
      if (api.defaults) {
        delete api.defaults.headers.common['Authorization'];
      } else if (api.axios) {
        delete api.axios.defaults.headers.common['Authorization'];
      }
      setCurrentUser(null);
      setIsAuthenticated(false);
      
      // Hiển thị thông báo phù hợp
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
      } else {
        toast.error('Có lỗi xảy ra, vui lòng đăng nhập lại');
      }
      
      throw error;
    }
  };

  // Add verifyEmail method to handle email verification
  const verifyEmail = async (token) => {
    console.log("AuthContext.verifyEmail called with token:", token);
    
    // Prevent duplicate verification attempts
    if (verifyEmail.isVerifying) {
      console.log("Already verifying email, preventing duplicate call");
      return false;
    }
    
    verifyEmail.isVerifying = true;
    
    try {
      setLoading(true);
      // Make API call to verify email
      console.log("Making API call to verify email");
      await api.get(`/api/v1/auth/verify-email?token=${token}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log("Email verification API call successful");
      toast.success('Xác thực email thành công!', {
        toastId: "email-verification-success",
        position: "top-right",
        autoClose: 3000
      });
      
      return true;
    } catch (error) {
      console.error('Email verification failed in AuthContext:', error);
      
      let errorMessage = "Đã xảy ra lỗi khi xác thực email. Vui lòng thử lại sau.";
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = "Token xác thực không hợp lệ hoặc đã hết hạn.";
        } else if (error.response.status === 404) {
          errorMessage = "Không tìm thấy tài khoản liên kết với token này.";
        } else if (error.response.status === 409) {
          errorMessage = "Email đã được xác thực trước đó.";
        }
      }
      
      toast.error(errorMessage, {
        toastId: "email-verification-error",
        position: "top-right",
        autoClose: 5000
      });
      
      return false;
    } finally {
      setLoading(false);
      verifyEmail.isVerifying = false;
    }
  };
  
  // Initialize the static flag
  verifyEmail.isVerifying = false;

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Thiết lập token cho API calls
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          if (!isTokenValid(token)) {
            // Token hết hạn, thử refresh token
            const newToken = await refreshToken();
            if (newToken) {
              await fetchUserProfile(newToken);
            } else {
              throw new Error('Failed to refresh token');
            }
          } else {
            await fetchUserProfile(token);
          }
        } catch (error) {
          console.error('Error during auth initialization:', error);
          // Xóa token và thông tin người dùng nếu không hợp lệ
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setCurrentUser(null);
          delete api.defaults.headers.common['Authorization'];
          toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      setLoading(false);
    };


    initializeAuth();

    // Listen for auth errors from the API interceptor
    const handleAuthError = () => {
      setCurrentUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    };

    window.addEventListener('auth-error', handleAuthError);
    
    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, []);

  const fetchUserProfile = async (token) => {
    if (!token) {
      throw new Error('No token provided');
    }

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Sử dụng REST API để lấy thông tin người dùng hiện tại
      const response = await api.get('/api/v1/users/me');
      
      if (response.data) {
        setCurrentUser(response.data);
        setIsAuthenticated(true);
      } else {
        console.warn('User data not found in response');
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          // Token không hợp lệ hoặc hết hạn
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setIsAuthenticated(false);
          setCurrentUser(null);
          toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        } else {
          // Lỗi khác từ server
          toast.error('Không thể lấy thông tin người dùng. Vui lòng thử lại sau.');
        }
      } else {
        // Lỗi mạng hoặc lỗi khác
        toast.error('Lỗi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại.');
      }
      throw error; // Ném lỗi để xử lý ở cấp cao hơn
    } finally {
      setLoading(false);
    }
  };

  // Thiết lập interval để tự động refresh token
  useEffect(() => {
    let refreshInterval;
    
    if (isAuthenticated) {
      // Kiểm tra và refresh token ngay lập tức khi component mount
      const checkAndRefreshToken = async () => {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            if (!isTokenValid(token)) {
              await refreshToken();
            }
          } catch (error) {
            console.error('Error refreshing token:', error);
            logout();
          }
        }
      };

      checkAndRefreshToken();

      // Thiết lập interval để kiểm tra token định kỳ
      refreshInterval = setInterval(checkAndRefreshToken, 4 * 60 * 1000); // Kiểm tra mỗi 4 phút
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isAuthenticated]);


  const login = async (credentials) => {
    try {
      setLoading(true);
      // Sử dụng REST API cho đăng nhập
      const response = await api.post('/api/v1/auth/login', credentials);
      const { token, user } = response.data;
      
      if (token && isTokenValid(token)) {
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setCurrentUser(user);
        setIsAuthenticated(true);
        toast.success('Đăng nhập thành công!');
        
        return true;
      } else {
        throw new Error('Token không hợp lệ');
      }
    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
      setCurrentUser(null);
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      // Sử dụng REST API cho đăng ký
      await api.post('/api/v1/auth/register', userData);
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      // Wrap email in proper object format for the ForgotPasswordDTO
      await api.post('/api/v1/auth/forgot-password', { email });
      toast.success('Vui lòng kiểm tra email để đặt lại mật khẩu');
      return true;
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || 'Yêu cầu không thành công');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (resetData) => {
    try {
      setLoading(true);
      
      // Validate resetData before sending to API
      if (!resetData || !resetData.token || !resetData.password) {
        console.error('Missing required reset password data');
        toast.error('Thiếu thông tin cần thiết để đặt lại mật khẩu');
        return false;
      }
      
      // Log the request data for debugging (remove in production)
      console.log('Reset password request data:', JSON.stringify({
        ...resetData,
        password: '[REDACTED]'
      }));
      
      // Ensure token is properly formatted
      const formattedData = {
        token: resetData.token,
        password: resetData.password,
        confirmPassword: resetData.confirmPassword || resetData.password
      };
      
      // Sử dụng REST API cho đặt lại mật khẩu
      await api.post('/api/v1/auth/reset-password', formattedData);
      toast.success('Đặt lại mật khẩu thành công!');
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      
      // Enhance error handling with more specific messages
      if (error.response) {
        const status = error.response.status;
        const errorMsg = error.response.data?.message;
        
        if (status === 400) {
          toast.error(errorMsg || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.');
        } else if (status === 404) {
          toast.error(errorMsg || 'Token đặt lại mật khẩu không tồn tại hoặc đã hết hạn.');
        } else if (status === 500) {
          toast.error('Lỗi máy chủ. Vui lòng thử lại sau.');
        } else {
          toast.error(errorMsg || 'Đặt lại mật khẩu thất bại');
        }
      } else {
        toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      // Sử dụng REST API để cập nhật thông tin người dùng
      const response = await api.put(`/api/v1/users/${currentUser.id}`, userData);
      setCurrentUser({...currentUser, ...response.data});
      toast.success('Cập nhật thông tin thành công');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cập nhật thông tin thất bại');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setCurrentUser(null);
    setIsAuthenticated(false);
    toast.info('Đăng xuất thành công');
  };

  const value = {
    currentUser,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    verifyEmail // Add verifyEmail to the context value
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
