import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import orderService from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
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

const MyOrders = () => {
  const { currentUser } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const ordersData = await orderService.getUserOrders(currentUser.username);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Không thể tải đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return;
    }
    
    try {
      setLoading(true);
      const cancelledOrder = await orderService.cancelOrder(orderId);
      
      if (cancelledOrder) {
        // Update the local orders state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? {...order, status: 'CANCELLED'} : order
          )
        );
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Không thể hủy đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    if (activeFilter === 'ALL') {
      return orders;
    }
    return orders.filter(order => order.status === activeFilter);
  };

  const getItemCount = (order) => {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading && orders.length === 0) {
    return <Loading message="Đang tải đơn hàng..." />;
  }

  if (error) {
    return (
      <div className="orders-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={fetchOrders} className="btn-primary">Thử lại</button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-container">
        <EmptyState
          title="Bạn chưa có đơn hàng nào"
          message="Hãy mua sắm và quay lại đây để xem đơn hàng của bạn"
          actionText="Mua sắm ngay"
          actionPath="/"
          icon="shopping-bag"
        />
      </div>
    );
  }

  const filteredOrders = getFilteredOrders();

  return (
    <div className="orders-container">
      <h1>Đơn hàng của tôi</h1>
      
      <div className="order-filters">
        <button 
          className={`filter-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveFilter('ALL')}
        >
          Tất cả
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'PENDING' ? 'active' : ''}`}
          onClick={() => setActiveFilter('PENDING')}
        >
          Chờ xác nhận
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'PROCESSING' ? 'active' : ''}`}
          onClick={() => setActiveFilter('PROCESSING')}
        >
          Đang xử lý
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'SHIPPED' ? 'active' : ''}`}
          onClick={() => setActiveFilter('SHIPPED')}
        >
          Đang giao hàng
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'DELIVERED' ? 'active' : ''}`}
          onClick={() => setActiveFilter('DELIVERED')}
        >
          Đã giao hàng
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'CANCELLED' ? 'active' : ''}`}
          onClick={() => setActiveFilter('CANCELLED')}
        >
          Đã hủy
        </button>
      </div>
      
      {filteredOrders.length === 0 ? (
        <div className="no-filtered-orders">
          <i className="fas fa-search"></i>
          <p>Không tìm thấy đơn hàng phù hợp với bộ lọc</p>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <span className="order-number">Đơn hàng #{order.orderNumber}</span>
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              
              <div className="order-products">
                {order.items.slice(0, 3).map((item, index) => (
                  <div key={index} className="order-product-preview">
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
                ))}
                {order.items.length > 3 && (
                  <div className="order-product-more">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>
              
              <div className="order-summary">
                <div className="order-total">
                  <span>Tổng tiền:</span>
                  <span className="total-amount">{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="order-items-count">
                  <span>{getItemCount(order)} sản phẩm</span>
                </div>
                <div className="order-payment-method">
                  <span>
                    {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 
                     order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản ngân hàng' : 
                     'Thanh toán trực tuyến'}
                  </span>
                </div>
              </div>
              
              <div className="order-actions">
                <Link to={`/my-orders/${order.id}`} className="btn-primary view-order-btn">
                  Xem chi tiết
                </Link>
                
                {order.status === 'PENDING' && (
                  <button 
                    className="btn-secondary cancel-order-btn"
                    onClick={() => cancelOrder(order.id)}
                  >
                    Hủy đơn hàng
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
