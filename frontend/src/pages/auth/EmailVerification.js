import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './Auth.css';

const EmailVerification = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Token xác thực không hợp lệ.');
        setLoading(false);
        return;
      }

      try {
        await api.get(`/api/v1/auth/verify-email/${token}`);
        setVerified(true);
        toast.success('Email đã được xác thực thành công!');
      } catch (err) {
        console.error('Verification error:', err);
        setError(
          err.response?.data?.message || 
          'Không thể xác thực email. Token không hợp lệ hoặc đã hết hạn.'
        );
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-form-container verification-container">
          <h2>Đang xác thực email...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-form-container verification-container">
        <h2>Xác thực email</h2>
        
        {verified ? (
          <div className="success-message">
            <div className="verification-icon success">
              <i className="fas fa-check-circle"></i>
            </div>
            <p>Email của bạn đã được xác thực thành công!</p>
            <p>Bây giờ bạn có thể đăng nhập và sử dụng đầy đủ các tính năng của ứng dụng.</p>
            <Link to="/login" className="btn-primary">Đăng nhập ngay</Link>
          </div>
        ) : (
          <div className="error-box">
            <div className="verification-icon error">
              <i className="fas fa-times-circle"></i>
            </div>
            <p className="error-message">{error}</p>
            <p>Vui lòng thử lại hoặc liên hệ hỗ trợ nếu cần giúp đỡ.</p>
            <div className="verification-actions">
              <Link to="/login" className="btn-secondary">Đăng nhập</Link>
              <Link to="/" className="btn-primary">Trang chủ</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;