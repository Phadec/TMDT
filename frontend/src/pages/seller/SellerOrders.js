import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import orderService from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import './SellerOrders.css';

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

const SellerOrders = () => {
  const { currentUser } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    revenue: 0
  });

  useEffect(() => {
    if (currentUser) {
      fetchSellerOrders();
    }
  }, [currentUser]);

  const fetchSellerOrders = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      console.log("Fetching seller orders for user:", currentUser.username);
      
      const ordersData = await orderService.getSellerOrders();
      setOrders(ordersData || []);
      
      // Calculate statistics
      const newStats = {
        total: ordersData.length,
        pending: ordersData.filter(o => o.status === 'PENDING').length,
        processing: ordersData.filter(o => o.status === 'PROCESSING').length,
        shipped: ordersData.filter(o => o.status === 'SHIPPED').length,
        delivered: ordersData.filter(o => o.status === 'DELIVERED').length,
        cancelled: ordersData.filter(o => o.status === 'CANCELLED').length,
        revenue: ordersData
          .filter(o => o.status === 'DELIVERED')
          .reduce((sum, order) => sum + order.totalAmount, 0)
      };
      
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching seller orders:', error);
      setError(`Không thể tải đơn hàng: ${error.message || 'Lỗi không xác định'}`);
      setOrders([]);
      setStats({
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        revenue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const result = await orderService.updateOrderStatus(orderId, newStatus);
      
      if (result) {
        // Update the local orders state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? {...order, status: newStatus} : order
          )
        );
        
        // Recalculate statistics
        const updatedOrders = orders.map(order => 
          order.id === orderId ? {...order, status: newStatus} : order
        );
        
        const newStats = {
          total: updatedOrders.length,
          pending: updatedOrders.filter(o => o.status === 'PENDING').length,
          processing: updatedOrders.filter(o => o.status === 'PROCESSING').length,
          shipped: updatedOrders.filter(o => o.status === 'SHIPPED').length,
          delivered: updatedOrders.filter(o => o.status === 'DELIVERED').length,
          cancelled: updatedOrders.filter(o => o.status === 'CANCELLED').length,
          revenue: updatedOrders
            .filter(o => o.status === 'DELIVERED')
            .reduce((sum, order) => sum + order.totalAmount, 0)
        };
        
        setStats(newStats);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const getNextStatus = (currentStatus) => {
    switch(currentStatus) {
      case 'PENDING': return 'PROCESSING';
      case 'PROCESSING': return 'SHIPPED';
      case 'SHIPPED': return 'DELIVERED';
      default: return null;
    }
  };

  const getFilteredOrders = () => {
    if (activeFilter === 'ALL') {
      return orders;
    }
    return orders.filter(order => order.status === activeFilter);
  };

  if (loading) {
    return <Loading message="Đang tải đơn hàng..." />;
  }

  if (error) {
    return (
      <div className="seller-orders-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={fetchSellerOrders} className="btn-primary">Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-orders-container">
      <h1>Quản lý đơn hàng</h1>
      
      {orders.length === 0 ? (
        <EmptyState
          title="Bạn chưa có đơn hàng nào"
          message="Khi có người mua sản phẩm của bạn, đơn hàng sẽ xuất hiện ở đây"
          actionText="Quản lý sản phẩm"
          actionPath="/my-products"
          icon="shopping-bag"
        />
      ) : (
        <>
          <div className="order-stats-cards">
            <div className="stat-card">
              <div className="stat-icon all-orders">
                <i className="fas fa-shopping-basket"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Tổng đơn hàng</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon pending-orders">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.pending}</div>
                <div className="stat-label">Chờ xác nhận</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon processing-orders">
                <i className="fas fa-cog"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.processing}</div>
                <div className="stat-label">Đang xử lý</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon shipped-orders">
                <i className="fas fa-truck"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.shipped}</div>
                <div className="stat-label">Đang giao hàng</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon revenue">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{formatCurrency(stats.revenue)}</div>
                <div className="stat-label">Doanh thu</div>
              </div>
            </div>
          </div>
          
          <div className="order-filters">
            <button 
              className={`filter-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveFilter('ALL')}
            >
              Tất cả ({stats.total})
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'PENDING' ? 'active' : ''}`}
              onClick={() => setActiveFilter('PENDING')}
            >
              Chờ xác nhận ({stats.pending})
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'PROCESSING' ? 'active' : ''}`}
              onClick={() => setActiveFilter('PROCESSING')}
            >
              Đang xử lý ({stats.processing})
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'SHIPPED' ? 'active' : ''}`}
              onClick={() => setActiveFilter('SHIPPED')}
            >
              Đang giao hàng ({stats.shipped})
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'DELIVERED' ? 'active' : ''}`}
              onClick={() => setActiveFilter('DELIVERED')}
            >
              Đã giao hàng ({stats.delivered})
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'CANCELLED' ? 'active' : ''}`}
              onClick={() => setActiveFilter('CANCELLED')}
            >
              Đã hủy ({stats.cancelled})
            </button>
          </div>
          
          {getFilteredOrders().length === 0 ? (
            <div className="no-filtered-orders">
              <i className="fas fa-search"></i>
              <p>Không tìm thấy đơn hàng phù hợp với bộ lọc</p>
            </div>
          ) : (
            <div className="seller-orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Mã đơn hàng</th>
                    <th>Khách hàng</th>
                    <th>Sản phẩm</th>
                    <th>Tổng tiền</th>
                    <th>Ngày đặt</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredOrders().map(order => (
                    <tr key={order.id}>
                      <td className="order-number-cell">
                        <span className="order-id">#{order.orderNumber}</span>
                      </td>
                      <td className="customer-cell">
                        <div className="customer-info">
                          <div className="customer-name">{order.customerInfo.fullName}</div>
                          <div className="customer-phone">{order.customerInfo.phone}</div>
                        </div>
                      </td>
                      <td className="products-cell">
                        <div className="order-products-summary">
                          <div className="product-images">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="product-image-small">
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
                              <div className="product-image-more">+{order.items.length - 3}</div>
                            )}
                          </div>
                          <div className="product-count">{order.items.length} sản phẩm</div>
                        </div>
                      </td>
                      <td className="amount-cell">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="date-cell">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="status-cell">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="actions-cell">
                        <Link to={`/seller/orders/${order.id}`} className="btn-view">
                          Chi tiết
                        </Link>
                        
                        {getNextStatus(order.status) && (
                          <button 
                            className="btn-update-status"
                            onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                          >
                            {order.status === 'PENDING' && 'Xác nhận'}
                            {order.status === 'PROCESSING' && 'Giao hàng'}
                            {order.status === 'SHIPPED' && 'Hoàn thành'}
                          </button>
                        )}
                        
                        {order.status === 'PENDING' && (
                          <button 
                            className="btn-cancel"
                            onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                          >
                            Hủy
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SellerOrders;
