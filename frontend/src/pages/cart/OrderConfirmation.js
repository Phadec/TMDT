import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { CartContext } from '../../contexts/CartContext';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const { fetchCartItems } = useContext(CartContext);
  const orderNumber = `ORD-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`;
  
  // Simulate clearing the cart after successful order
  useEffect(() => {
    // Refresh cart to be empty (since we've completed the purchase)
    fetchCartItems();
  }, [fetchCartItems]);
  
  return (
    <div className="order-confirmation-container">
      <div className="order-confirmation-card">
        <div className="success-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        
        <h1>Đặt hàng thành công!</h1>
        
        <div className="order-number">
          <span>Mã đơn hàng:</span>
          <strong>{orderNumber}</strong>
        </div>
        
        <p className="thank-you-message">
          Cảm ơn bạn đã mua sắm tại Chợ Việt. Đơn hàng của bạn đang được xử lý.
        </p>
        
        <div className="order-info">
          <p>Chúng tôi đã gửi email xác nhận đơn hàng đến địa chỉ email của bạn.</p>
          <p>Đơn hàng của bạn sẽ được xử lý và giao trong vòng 2-3 ngày làm việc.</p>
        </div>
        
        <div className="delivery-steps">
          <div className="step completed">
            <div className="step-icon">
              <i className="fas fa-shopping-cart"></i>
            </div>
            <div className="step-content">
              <h3>Đơn hàng đã đặt</h3>
              <p>Đơn hàng của bạn đã được xác nhận</p>
            </div>
          </div>
          
          <div className="step active">
            <div className="step-icon">
              <i className="fas fa-box"></i>
            </div>
            <div className="step-content">
              <h3>Đang chuẩn bị</h3>
              <p>Đơn hàng đang được chuẩn bị</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-icon">
              <i className="fas fa-truck"></i>
            </div>
            <div className="step-content">
              <h3>Đang giao hàng</h3>
              <p>Đơn hàng đang được giao đến bạn</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-icon">
              <i className="fas fa-home"></i>
            </div>
            <div className="step-content">
              <h3>Đã giao hàng</h3>
              <p>Đơn hàng đã được giao thành công</p>
            </div>
          </div>
        </div>
        
        <div className="order-actions">
          <Link to="/" className="btn-primary">
            <i className="fas fa-home"></i> Quay về trang chủ
          </Link>
          <Link to="/profile" className="btn-secondary">
            <i className="fas fa-user"></i> Xem đơn hàng của tôi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;