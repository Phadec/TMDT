import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import orderService from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Loading from '../../components/common/Loading';
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

const SellerOrderDetail = () => {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const orderContentRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      fetchOrderDetails();
    }
  }, [id, currentUser]);

  const fetchOrderDetails = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      console.log("Fetching seller order details for ID:", id);
      
      const orderDetail = await orderService.getSellerOrderDetail(id);
      if (orderDetail) {
        setOrder(orderDetail);
      } else {
        setError('Không tìm thấy thông tin đơn hàng hoặc bạn không có quyền xem đơn hàng này.');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError(`Không thể tải thông tin đơn hàng: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      setLoading(true);
      const result = await orderService.updateOrderStatus(id, newStatus);
      
      if (result) {
        setOrder(prevOrder => ({...prevOrder, status: newStatus}));
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
  
  const refreshOrderDetails = () => {
    fetchOrderDetails();
  };
  
  const toggleFullscreen = () => {
    setFullscreenMode(!fullscreenMode);
  };
  
  const handleImageClick = (imageUrl) => {
    setExpandedImage(imageUrl);
  };
  
  const closeExpandedImage = () => {
    setExpandedImage(null);
  };

  if (loading) {
    return <Loading message="Đang tải thông tin đơn hàng..." />;
  }

  if (error) {
    return (
      <div className="seller-order-detail-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={() => navigate('/seller/orders')} className="btn-primary">
            Quay lại danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="seller-order-detail-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <p>Không tìm thấy đơn hàng</p>
          <button onClick={() => navigate('/seller/orders')} className="btn-primary">
            Quay lại danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`seller-order-detail-container ${fullscreenMode ? 'fullscreen-mode' : ''}`}>
      <div className="order-detail-header">
        <div className="back-button" onClick={() => navigate('/seller/orders')}>
          <i className="fas fa-arrow-left"></i> Quay lại
        </div>
        
        <h1>Chi tiết đơn hàng #{order.orderNumber}</h1>
        
        <div className="order-detail-meta">
          <span className="order-detail-date">Ngày đặt: {formatDate(order.createdAt)}</span>
          <OrderStatusBadge status={order.status} />
          <div className="order-id-badge">Mã đơn hàng: #{order.id}</div>
          <div className="order-controls">
            <button onClick={refreshOrderDetails} className="btn-refresh" title="Làm mới">
              <i className="fas fa-sync-alt"></i>
            </button>
            <button onClick={toggleFullscreen} className="btn-fullscreen" title="Xem toàn màn hình">
              <i className={`fas fa-${fullscreenMode ? 'compress' : 'expand'}`}></i>
            </button>
          </div>
        </div>
      </div>
      
      <div className="order-detail-actions">
        {getNextStatus(order.status) && (
          <button 
            className="btn-primary btn-update-status"
            onClick={() => updateOrderStatus(getNextStatus(order.status))}
          >
            <i className={order.status === 'PENDING' ? 'fas fa-check-circle' : 
                         order.status === 'PROCESSING' ? 'fas fa-truck' : 
                         order.status === 'SHIPPED' ? 'fas fa-box-open' : 'fas fa-check'}></i>
            {order.status === 'PENDING' && 'Xác nhận đơn hàng'}
            {order.status === 'PROCESSING' && 'Giao hàng'}
            {order.status === 'SHIPPED' && 'Xác nhận đã giao hàng'}
          </button>
        )}
        
        {order.status === 'PENDING' && (
          <button 
            className="btn-danger btn-cancel-order"
            onClick={() => {
              if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
                updateOrderStatus('CANCELLED');
              }
            }}
          >
            <i className="fas fa-times-circle"></i> Hủy đơn hàng
          </button>
        )}
        
        <button className="btn-secondary btn-print-order" onClick={() => window.print()}>
          <i className="fas fa-print"></i> In đơn hàng
        </button>
        
        <button className="btn-secondary btn-export-order" onClick={() => {
          alert('Tính năng này đang được phát triển!');
        }}>
          <i className="fas fa-file-export"></i> Xuất đơn hàng
        </button>
      </div>
      
      <div className="seller-order-detail-content" ref={orderContentRef}>
        <div className="order-detail-main">
          <div className="order-detail-products">
            <h2><i className="fas fa-shopping-basket"></i> Sản phẩm trong đơn hàng <span className="item-count">({order.items.length})</span></h2>
            
            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Đơn giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="product-cell">
                        <div className="product-image" onClick={() => handleImageClick(
                          item.product.images && item.product.images.length > 0 ? 
                          item.product.images[0] : '/images/placeholder.jpg'
                        )}>
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
                          <div className="image-zoom-hint">
                            <i className="fas fa-search-plus"></i>
                          </div>
                        </div>
                        <div className="product-info">
                          <div className="product-title">{item.product.title}</div>
                          <div className="product-id">ID: {item.product.id}</div>
                          {item.product.sku && <div className="product-sku">SKU: {item.product.sku}</div>}
                          {item.variant && <div className="product-variant">Phiên bản: {item.variant}</div>}
                        </div>
                      </td>
                      <td className="price-cell">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="quantity-cell">
                        {item.quantity}
                      </td>
                      <td className="total-cell">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="summary-label">Tạm tính</td>
                    <td className="summary-value">{formatCurrency(order.totalAmount)}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="summary-label">Phí vận chuyển</td>
                    <td className="summary-value">{order.shippingFee ? formatCurrency(order.shippingFee) : 'Miễn phí'}</td>
                  </tr>
                  {order.discount > 0 && (
                    <tr>
                      <td colSpan="3" className="summary-label">Giảm giá</td>
                      <td className="summary-value discount-value">-{formatCurrency(order.discount)}</td>
                    </tr>
                  )}
                  <tr className="order-total-row">
                    <td colSpan="3" className="total-label">Tổng cộng</td>
                    <td className="total-value">{formatCurrency(order.totalAmount - (order.discount || 0) + (order.shippingFee || 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          {order.shippingInfo && (
            <div className="order-shipping-info">
              <h2><i className="fas fa-shipping-fast"></i> Thông tin vận chuyển</h2>
              <div className="shipping-info-content">
                <div className="detail-row">
                  <span className="detail-icon"><i className="fas fa-truck"></i></span>
                  <span className="detail-label">Phương thức:</span>
                  <span className="detail-value">{order.shippingInfo.method || 'Giao hàng tiêu chuẩn'}</span>
                </div>
                {order.shippingInfo.trackingNumber && (
                  <div className="detail-row">
                    <span className="detail-icon"><i className="fas fa-barcode"></i></span>
                    <span className="detail-label">Mã vận đơn:</span>
                    <span className="detail-value">{order.shippingInfo.trackingNumber}</span>
                  </div>
                )}
                {order.shippingInfo.estimatedDelivery && (
                  <div className="detail-row">
                    <span className="detail-icon"><i className="fas fa-calendar-alt"></i></span>
                    <span className="detail-label">Dự kiến giao:</span>
                    <span className="detail-value">{formatDate(order.shippingInfo.estimatedDelivery)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="order-notes-section">
            {order.notes ? (
              <>
                <h2><i className="fas fa-sticky-note"></i> Ghi chú đơn hàng</h2>
                <div className="order-notes-content">
                  <p>{order.notes}</p>
                </div>
              </>
            ) : (
              <>
                <h2><i className="fas fa-sticky-note"></i> Ghi chú đơn hàng</h2>
                <div className="order-notes-content empty-notes">
                  <p><i>Không có ghi chú cho đơn hàng này</i></p>
                </div>
              </>
            )}
          </div>
          
          <div className="order-timeline">
            <h2><i className="fas fa-history"></i> Lịch sử đơn hàng</h2>
            
            <div className="timeline">
              <div className={`timeline-item active`}>
                <div className="timeline-icon">
                  <i className="fas fa-shopping-cart"></i>
                </div>
                <div className="timeline-content">
                  <h3>Đặt hàng</h3>
                  <p>Đơn hàng đã được tạo</p>
                  <div className="timeline-date">{formatDate(order.createdAt)}</div>
                </div>
              </div>
              
              {order.status === 'CANCELLED' ? (
                <div className="timeline-item cancelled active">
                  <div className="timeline-icon">
                    <i className="fas fa-ban"></i>
                  </div>
                  <div className="timeline-content">
                    <h3>Đã hủy</h3>
                    <p>Đơn hàng đã bị hủy</p>
                    <div className="timeline-date">{formatDate(order.updatedAt || order.createdAt)}</div>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`timeline-item ${order.status !== 'PENDING' ? 'active' : ''}`}>
                    <div className="timeline-icon">
                      <i className="fas fa-clipboard-check"></i>
                    </div>
                    <div className="timeline-content">
                      <h3>Xác nhận</h3>
                      <p>Đơn hàng đã được xác nhận</p>
                      {order.status !== 'PENDING' && (
                        <div className="timeline-date">{formatDate(order.updatedAt || order.createdAt)}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className={`timeline-item ${(order.status === 'SHIPPED' || order.status === 'DELIVERED') ? 'active' : ''}`}>
                    <div className="timeline-icon">
                      <i className="fas fa-truck"></i>
                    </div>
                    <div className="timeline-content">
                      <h3>Giao hàng</h3>
                      <p>Đơn hàng đang được giao</p>
                      {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                        <div className="timeline-date">{formatDate(order.updatedAt || order.createdAt)}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className={`timeline-item ${order.status === 'DELIVERED' ? 'active' : ''}`}>
                    <div className="timeline-icon">
                      <i className="fas fa-box-open"></i>
                    </div>
                    <div className="timeline-content">
                      <h3>Hoàn thành</h3>
                      <p>Đơn hàng đã được giao thành công</p>
                      {order.status === 'DELIVERED' && (
                        <div className="timeline-date">{formatDate(order.updatedAt || order.createdAt)}</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="order-detail-sidebar">
          <div className="order-detail-customer">
            <h2><i className="fas fa-user"></i> Thông tin khách hàng</h2>
            
            <div className="customer-detail-card">
              <div className="customer-info-header">
                <div className="customer-avatar">
                  <i className="fas fa-user-circle"></i>
                </div>
                <div className="customer-name-primary">{order.customerInfo.fullName}</div>
              </div>
              
              <div className="customer-info-body">
                <div className="detail-row">
                  <span className="detail-icon"><i className="fas fa-envelope"></i></span>
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">
                    <a href={`mailto:${order.customerInfo.email}`}>{order.customerInfo.email}</a>
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-icon"><i className="fas fa-phone"></i></span>
                  <span className="detail-label">Số điện thoại:</span>
                  <span className="detail-value">
                    <a href={`tel:${order.customerInfo.phone}`}>{order.customerInfo.phone}</a>
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-icon"><i className="fas fa-map-marker-alt"></i></span>
                  <span className="detail-label">Địa chỉ giao hàng:</span>
                  <span className="detail-value address">{order.customerInfo.address}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-icon"><i className="fas fa-credit-card"></i></span>
                  <span className="detail-label">Phương thức thanh toán:</span>
                  <span className="detail-value payment-method">
                    {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 
                     order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản ngân hàng' : 
                     order.paymentMethod === 'CREDIT_CARD' ? 'Thẻ tín dụng' : 
                     'Thanh toán trực tuyến'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-summary-card">
            <h2><i className="fas fa-file-invoice-dollar"></i> Thông tin thanh toán</h2>
            
            <div className="summary-content">
              <div className="summary-row">
                <span className="summary-label">Tạm tính</span>
                <span className="summary-value">{formatCurrency(order.totalAmount)}</span>
              </div>
              
              <div className="summary-row">
                <span className="summary-label">Phí vận chuyển</span>
                <span className="summary-value">{order.shippingFee ? formatCurrency(order.shippingFee) : 'Miễn phí'}</span>
              </div>
              
              <div className="summary-row">
                <span className="summary-label">Giảm giá</span>
                <span className="summary-value">
                  {order.discount ? `-${formatCurrency(order.discount)}` : '0 ₫'}
                </span>
              </div>
              
              <div className="summary-row total">
                <span className="summary-label">Tổng cộng</span>
                <span className="summary-value">{formatCurrency(order.totalAmount - (order.discount || 0) + (order.shippingFee || 0))}</span>
              </div>
              
              <div className="summary-badge">
                {order.paymentStatus === 'PAID' || order.status === 'DELIVERED' ? (
                  <span className="payment-badge paid">Đã thanh toán</span>
                ) : (
                  <span className="payment-badge pending">Chưa thanh toán</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="seller-actions-card">
            <h2><i className="fas fa-tools"></i> Thao tác bổ sung</h2>
            
            <div className="action-buttons">
              <button className="btn-secondary btn-block" onClick={() => {
                alert('Tính năng đang được phát triển!');
              }}>
                <i className="fas fa-comments"></i> Liên hệ khách hàng
              </button>
              
              <button className="btn-secondary btn-block" onClick={() => {
                alert('Tính năng đang được phát triển!');
              }}>
                <i className="fas fa-tags"></i> Tạo khuyến mãi cho khách
              </button>
              
              <button className="btn-secondary btn-block" onClick={refreshOrderDetails}>
                <i className="fas fa-sync-alt"></i> Làm mới thông tin
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {(order.prevOrderId || order.nextOrderId) && (
        <div className="order-navigation">
          <div className="order-nav-buttons">
            {order.prevOrderId && (
              <Link to={`/seller/orders/${order.prevOrderId}`} className="btn-secondary">
                <i className="fas fa-chevron-left"></i> Đơn hàng trước
              </Link>
            )}
            {order.nextOrderId && (
              <Link to={`/seller/orders/${order.nextOrderId}`} className="btn-secondary">
                Đơn hàng tiếp theo <i className="fas fa-chevron-right"></i>
              </Link>
            )}
          </div>
        </div>
      )}
      
      {expandedImage && (
        <div className="expanded-image-modal" onClick={closeExpandedImage}>
          <div className="expanded-image-container">
            <img src={expandedImage} alt="Expanded product" />
            <button className="close-expanded-image" onClick={closeExpandedImage}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrderDetail;
