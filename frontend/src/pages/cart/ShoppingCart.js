import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../contexts/CartContext';
import { AuthContext } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import './ShoppingCart.css';

const ShoppingCart = () => {
  const { cartItems, loading, removeFromCart, updateCartItemQuantity, clearCart, getCartTotal } = useContext(CartContext);
  const { currentUser } = useContext(AuthContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  
  const handleRemoveItem = async (productId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      await removeFromCart(productId);
    }
  };
  
  const handleQuantityChange = async (productId, currentQuantity, newQuantity) => {
    // Ensure quantity is at least 1
    const quantity = Math.max(1, newQuantity);
    if (quantity !== currentQuantity) {
      await updateCartItemQuantity(productId, quantity);
    }
  };
  
  const handleClearCart = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
      await clearCart();
    }
  };
  
  const handleCheckout = () => {
    // Redirect to checkout page
    navigate('/checkout');
  };
  
  if (loading) {
    return <Loading message="Đang tải giỏ hàng..." />;
  }
  
  if (!currentUser) {
    return (
      <div className="shopping-cart-container">
        <EmptyState
          title="Bạn chưa đăng nhập"
          message="Vui lòng đăng nhập để xem giỏ hàng của bạn"
          actionText="Đăng nhập ngay"
          actionPath="/login"
          icon="user"
        />
      </div>
    );
  }
  
  if (cartItems.length === 0) {
    return (
      <div className="shopping-cart-container">
        <EmptyState
          title="Giỏ hàng trống"
          message="Bạn chưa có sản phẩm nào trong giỏ hàng"
          actionText="Tiếp tục mua sắm"
          actionPath="/"
          icon="shopping-cart"
        />
      </div>
    );
  }
  
  return (
    <div className="shopping-cart-container">
      <h1 className="cart-title">Giỏ hàng của bạn</h1>
      
      <div className="cart-content">
        <div className="cart-items">
          <div className="cart-header">
            <div className="cart-header-product">Sản phẩm</div>
            <div className="cart-header-price">Đơn giá</div>
            <div className="cart-header-quantity">Số lượng</div>
            <div className="cart-header-total">Thành tiền</div>
            <div className="cart-header-actions">Thao tác</div>
          </div>
          
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-product">
                <div className="cart-item-image">
                  <img 
                    src={item.images && item.images.length > 0 ? item.images[0] : '/images/placeholder.jpg'} 
                    alt={item.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                </div>
                <div className="cart-item-details">
                  <Link to={`/product/${item.id}`} className="cart-item-title">
                    {item.title}
                  </Link>
                  <div className="cart-item-meta">
                    <span className="cart-item-condition">{item.condition}</span>
                    {item.negotiable && <span className="cart-item-negotiable">Có thể thương lượng</span>}
                  </div>
                </div>
              </div>
              
              <div className="cart-item-price">
                {formatCurrency(item.price)}
              </div>
              
              <div className="cart-item-quantity">
                <div className="quantity-control">
                  <button 
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(item.id, item.quantity, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <input 
                    type="number" 
                    min="1" 
                    value={item.quantity || 1} 
                    onChange={(e) => handleQuantityChange(item.id, item.quantity, parseInt(e.target.value) || 1)}
                    className="quantity-input"
                  />
                  <button 
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(item.id, item.quantity, item.quantity + 1)}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              
              <div className="cart-item-total">
                {formatCurrency(item.price * (item.quantity || 1))}
              </div>
              
              <div className="cart-item-actions">
                <button 
                  className="btn-remove"
                  onClick={() => handleRemoveItem(item.id)}
                  title="Xóa sản phẩm"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ))}
          
          <div className="cart-actions">
            <button 
              className="btn-secondary clear-cart"
              onClick={handleClearCart}
              disabled={isProcessing}
            >
              <i className="fas fa-trash-alt"></i> Xóa tất cả
            </button>
            <Link to="/" className="btn-secondary continue-shopping">
              <i className="fas fa-arrow-left"></i> Tiếp tục mua sắm
            </Link>
          </div>
        </div>
        
        <div className="cart-summary">
          <h2 className="summary-title">Thông tin đơn hàng</h2>
          
          <div className="summary-details">
            <div className="summary-row">
              <span className="summary-label">Tổng sản phẩm:</span>
              <span className="summary-value">{cartItems.reduce((total, item) => total + (item.quantity || 1), 0)}</span>
            </div>
            
            <div className="summary-row">
              <span className="summary-label">Tạm tính:</span>
              <span className="summary-value">{formatCurrency(getCartTotal())}</span>
            </div>
            
            <div className="summary-row">
              <span className="summary-label">Phí vận chuyển:</span>
              <span className="summary-value">Miễn phí</span>
            </div>
            
            <div className="summary-total">
              <span className="summary-total-label">Tổng cộng:</span>
              <span className="summary-total-value">{formatCurrency(getCartTotal())}</span>
            </div>
          </div>
          
          <button 
            className="btn-primary checkout-btn"
            onClick={handleCheckout}
            disabled={loading}
          >
            <i className="fas fa-check-circle"></i> Tiến hành thanh toán
          </button>
          
          <div className="checkout-note">
            <p>Với việc tiến hành đặt hàng, bạn đồng ý với các điều khoản và điều kiện của chúng tôi.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
