import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './VerifyEmail.css';

const VerifyEmail = () => {
  const [verificationState, setVerificationState] = useState({
    isLoading: true,
    isSuccess: false,
    error: null
  });

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  
  // Get verifyEmail method from AuthContext
  const { verifyEmail, loading } = useContext(AuthContext);
  
  // Create ref inside component body
  const verificationAttemptedRef = useRef(false);

  useEffect(() => {
    console.log("VerifyEmail component effect running with token:", token);
    
    const handleVerifyEmail = async () => {
      // Skip if already attempted or no token
      if (verificationAttemptedRef.current) {
        console.log("Verification already attempted, skipping duplicate call");
        return;
      }
      
      if (!token) {
        console.log("No token found, setting error state");
        setVerificationState({
          isLoading: false,
          isSuccess: false,
          error: "Token xác thực không hợp lệ. Vui lòng kiểm tra đường dẫn trong email của bạn."
        });
        return;
      }
      
      // Mark verification as attempted BEFORE making the API call
      verificationAttemptedRef.current = true;
      console.log("Starting email verification, setting attempted flag");
      
      try {
        // Call verifyEmail from AuthContext
        console.log("Calling verifyEmail with token:", token);
        const success = await verifyEmail(token);
        console.log("Verification result:", success);
        
        setVerificationState({
          isLoading: false,
          isSuccess: success,
          error: success ? null : "Xác thực email thất bại. Vui lòng thử lại sau."
        });
      } catch (error) {
        console.error("Verification error:", error);
        setVerificationState({
          isLoading: false,
          isSuccess: false,
          error: "Đã xảy ra lỗi khi xác thực email. Vui lòng thử lại sau."
        });
      }
    };

    // Only attempt verification if we have a token
    if (token && !verificationAttemptedRef.current) {
      handleVerifyEmail();
    } else if (!token) {
      setVerificationState({
        isLoading: false,
        isSuccess: false,
        error: "Token xác thực không hợp lệ. Vui lòng kiểm tra đường dẫn trong email của bạn."
      });
    }
    
  }, [token, verifyEmail]); // Include dependencies

  // Show loading state from either component state or AuthContext
  const isLoading = verificationState.isLoading || loading;

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        {isLoading ? (
          <div className="verification-loading">
            <div className="spinner"></div>
            <p>Đang xác thực email của bạn...</p>
          </div>
        ) : verificationState.isSuccess ? (
          <div className="verification-success">
            <div className="verification-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2>Xác thực email thành công!</h2>
            <p>Địa chỉ email của bạn đã được xác thực thành công.</p>
            <p>Bây giờ bạn có thể tiếp tục sử dụng tất cả các tính năng trên hệ thống của chúng tôi.</p>
            <div className="verification-actions">
              <Link to="/login" className="btn-primary">
                Đăng nhập
              </Link>
              <Link to="/" className="btn-secondary">
                Về trang chủ
              </Link>
            </div>
          </div>
        ) : (
          <div className="verification-error">
            <div className="verification-icon">
              <i className="fas fa-times-circle"></i>
            </div>
            <h2>Xác thực email thất bại</h2>
            <p>{verificationState.error}</p>
            <div className="verification-actions">
              <Link to="/login" className="btn-primary">
                Đăng nhập
              </Link>
              <Link to="/" className="btn-secondary">
                Về trang chủ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
