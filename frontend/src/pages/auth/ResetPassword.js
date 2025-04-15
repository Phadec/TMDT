import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './Auth.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { resetPassword } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Extract token from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const tokenFromURL = queryParams.get('token');
    
    if (tokenFromURL) {
      setToken(tokenFromURL);
      console.log('Token extracted from URL:', tokenFromURL.substring(0, 10) + '...');
    } else {
      console.error('No token found in URL');
      setError('Không tìm thấy token đặt lại mật khẩu. Vui lòng kiểm tra lại liên kết.');
    }
  }, [location]);

  const validatePassword = (pass) => {
    // Basic password validation
    if (pass.length < 8) {
      return 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset previous errors
    setError('');
    
    // Validate token
    if (!token) {
      setError('Không tìm thấy token đặt lại mật khẩu');
      return;
    }
    
    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    // Validate password confirmation
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Log request data for debugging (remove in production)
      console.log('Submitting reset password with token:', token.substring(0, 10) + '...');
      
      const resetData = {
        token: token,
        password: password,
        confirmPassword: confirmPassword
      };
      
      console.log('Reset password payload structure:', JSON.stringify({
        ...resetData,
        password: '[REDACTED]',
        confirmPassword: '[REDACTED]'
      }));
      
      const result = await resetPassword(resetData);
      
      if (result) {
        setSuccess(true);
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError('Không thể đặt lại mật khẩu. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Reset password error in component:', err);
      setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Đặt lại mật khẩu</h2>
        
        {success ? (
          <div className="success-message">
            <p>Mật khẩu của bạn đã được đặt lại thành công!</p>
            <p>Bạn sẽ được chuyển hướng đến trang đăng nhập sau vài giây...</p>
            <Link to="/login" className="btn-primary">Đăng nhập ngay</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="password">Mật khẩu mới</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                disabled={isSubmitting}
                minLength="8"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                disabled={isSubmitting}
                minLength="8"
                required
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isSubmitting || !token}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>
            </div>
            
            <div className="auth-links">
              <Link to="/login">Quay lại đăng nhập</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
