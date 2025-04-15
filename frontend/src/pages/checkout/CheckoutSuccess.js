import React, { useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import './CheckoutSuccess.css';

const CheckoutSuccess = () => {
  const { id } = useParams();
  const location = useLocation();
  const orderNumber = location.state?.orderNumber || 'N/A';

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="checkout-success-container">
      <div className="success-card">
        <div className="success-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        
        <h1>Đặt hàng thành công!</h1>
        
        <p className="order-number">
          Mã đơn hàng: <strong>{orderNumber}</strong>
        </p>
        
        <p className="success-message">
          Cảm ơn bạn đã đặt hàng. Chúng tôi đã nhận được đơn hàng và sẽ bắt đầu xử lý ngay lập tức.
        </p>
        
        <div className="order-info">
          <p>
            <i className="fas fa-envelope"></i> Chúng tôi đã gửi xác nhận đơn hàng đến email của bạn.
          </p>
          <p>
            <i className="fas fa-truck"></i> Bạn có thể theo dõi trạng thái đơn hàng trong trang "Đơn hàng của tôi".
          </p>
        </div>
        
        <div className="success-actions">
          <Link to="/my-orders" className="btn-primary">
            <i className="fas fa-clipboard-list"></i> Xem đơn hàng của tôi
          </Link>
          <Link to="/" className="btn-secondary">
            <i className="fas fa-home"></i> Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
