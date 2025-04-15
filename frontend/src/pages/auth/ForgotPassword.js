import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { forgotPassword } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Improved email validation
    if (!email.trim()) {
      setError('Vui lòng nhập email của bạn');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const result = await forgotPassword(email);
      if (result) {
        setSuccess(true);
      } else {
        setError('Không thể gửi yêu cầu. Vui lòng thử lại sau.');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      console.error('Forgot password error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Quên mật khẩu</h2>
        
        {success ? (
          <div className="success-message">
            <p>Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu vào địa chỉ email của bạn.</p>
            <p>Vui lòng kiểm tra hộp thư đến và làm theo hướng dẫn.</p>
            <Link to="/login" className="btn-primary">Trở về trang đăng nhập</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email đã đăng ký"
                disabled={isSubmitting}
              />
              {error && <span className="error-message">{error}</span>}
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Gửi yêu cầu'}
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

export default ForgotPassword;
