import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import orderService from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Loading from '../../components/common/Loading';
import './Orders.css';

const OrderStatusBadge = ({ status }) => {
  const getStatusDetails = (status) => {
    switch(status) {
      case 'PENDING':
        return { label: 'Chờ xác nhận', className: 'status-pending', icon: 'clock' };
      case 'PROCESSING':
        return { label: 'Đang xử lý', className: 'status-processing', icon: 'cog' };
      case 'SHIPPED':
        return { label: 'Đang giao hàng', className: 'status-shipped', icon: 'truck' };
      case 'DELIVERED':
        return { label: 'Đã giao hàng', className: 'status-delivered', icon: 'check-circle' };
      case 'CANCELLED':
        return { label: 'Đã hủy', className: 'status-cancelled', icon: 'times-circle' };
      default:
        return { label: 'Không xác định', className: 'status-unknown', icon: 'question-circle' };
    }
  };

  const { label, className, icon } = getStatusDetails(status);
  
  return (
    <span className={`status-badge ${className}`}>
      <i className={`fas fa-${icon}`}></i> {label}
    </span>
  );
};

const OrderDetail = () => {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const orderData = await orderService.getOrderById(id);
      
      if (orderData) {
        setOrder(orderData);
      } else {
        setError('Không tìm thấy thông tin đơn hàng.');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return;
    }
    
    try {
      setLoading(true);
      const cancelledOrder = await orderService.cancelOrder(id);
      
      if (cancelledOrder) {
        setOrder(prevOrder => ({...prevOrder, status: 'CANCELLED'}));
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Không thể hủy đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusTimeline = (status) => {
    const allStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = allStatuses.indexOf(status);
    
    if (status === 'CANCELLED') {
      return allStatuses.map(s => ({
        status: s,
        completed: false,
        current: false
      }));
    }
    
    return allStatuses.map((s, index) => ({
      status: s,
      completed: index < currentIndex,
      current: index === currentIndex
    }));
  };

  if (loading) {
    return <Loading message="Đang tải thông tin đơn hàng..." />;
  }

  if (error) {
    return (
      <div className="order-detail-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={() => navigate('/my-orders')} className="btn-primary">
            Quay lại danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <p>Không tìm thấy đơn hàng</p>
          <button onClick={() => navigate('/my-orders')} className="btn-primary">
            Quay lại danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  const statusTimeline = getOrderStatusTimeline(order.status);

  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <div className="back-button" onClick={() => navigate('/my-orders')}>
          <i className="fas fa-arrow-left"></i> Quay lại
        </div>
        
        <h1>Chi tiết đơn hàng #{order.orderNumber}</h1>
        
        <div className="order-detail-meta">
          <span className="order-detail-date">Ngày đặt: {formatDate(order.createdAt)}</span>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>
      
      {order.status !== 'CANCELLED' && (
        <div className="order-status-timeline">
          {statusTimeline.map((item, index) => (
            <div key={index} className={`timeline-step ${item.completed ? 'completed' : ''} ${item.current ? 'current' : ''}`}>
              <div className="timeline-icon">
                {item.status === 'PENDING' && <i className="fas fa-clipboard-check"></i>}
                {item.status === 'PROCESSING' && <i className="fas fa-box"></i>}
                {item.status === 'SHIPPED' && <i className="fas fa-truck"></i>}
                {item.status === 'DELIVERED' && <i className="fas fa-home"></i>}
              </div>
              <div className="timeline-label">
                {item.status === 'PENDING' && 'Xác nhận'}
                {item.status === 'PROCESSING' && 'Chuẩn bị hàng'}
                {item.status === 'SHIPPED' && 'Vận chuyển'}
                {item.status === 'DELIVERED' && 'Giao hàng'}
              </div>
              {index < statusTimeline.length - 1 && <div className="timeline-connector"></div>}
            </div>
          ))}
        </div>
      )}
      
      {order.status === 'CANCELLED' && (
        <div className="order-cancelled-banner">
          <i className="fas fa-ban"></i>
          <span>Đơn hàng này đã bị hủy</span>
        </div>
      )}
      
      <div className="order-detail-content">
        <div className="order-detail-products">
          <h2>Sản phẩm đã đặt</h2>
          
          <div className="order-detail-product-list">
            {order.items.map((item, index) => (
              <div key={index} className="order-detail-product">
                <div className="product-image">
                  <img 
                    src={item.product.images && item.product.images.length > 0 ? 
                      item.product.images[0] : '/images/placeholder.jpg'
                    } 
                    alt={item.product.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                </div>
                
                <div className="product-info">
                  <h3 className="product-title">
                    <Link to={`/products/${item.product.id}`}>
                      {item.product.title}
                    </Link>
                  </h3>
                  <p className="product-description">
                    {item.product.description.substring(0, 100)}
                    {item.product.description.length > 100 ? '...' : ''}
                  </p>
                </div>
                
                <div className="product-price">
                  <span className="product-unit-price">{formatCurrency(item.price)}</span>
                  <span className="product-quantity">x {item.quantity}</span>
                  <span className="product-total-price">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="order-detail-sidebar">
          <div className="order-detail-summary">
            <h2>Tổng thanh toán</h2>
            
            <div className="summary-row">
              <span>Tạm tính</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            
            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <span>Miễn phí</span>
            </div>
            
            <div className="summary-total">
              <span>Tổng cộng</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            
            <div className="payment-method">
              <strong>Phương thức thanh toán:</strong>
              <span>
                {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 
                 order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản ngân hàng' : 
                 'Thanh toán trực tuyến'}
              </span>
            </div>
          </div>
          
          <div className="shipping-info">
            <h2>Thông tin giao hàng</h2>
            
            <div className="info-row">
              <strong>Người nhận:</strong>
              <span>{order.customerInfo.fullName}</span>
            </div>
            
            <div className="info-row">
              <strong>Số điện thoại:</strong>
              <span>{order.customerInfo.phone}</span>
            </div>
            
            <div className="info-row">
              <strong>Email:</strong>
              <span>{order.customerInfo.email}</span>
            </div>
            
            <div className="info-row">
              <strong>Địa chỉ:</strong>
              <span>{order.customerInfo.address}</span>
            </div>
            
            {order.notes && (
              <div className="info-row">
                <strong>Ghi chú:</strong>
                <span>{order.notes}</span>
              </div>
            )}
          </div>
          
          {order.status === 'PENDING' && (
            <button 
              className="btn-secondary cancel-order-btn"
              onClick={cancelOrder}
            >
              Hủy đơn hàng
            </button>
          )}
          
          <Link to="/" className="btn-primary continue-shopping">
            <i className="fas fa-shopping-cart"></i> Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
