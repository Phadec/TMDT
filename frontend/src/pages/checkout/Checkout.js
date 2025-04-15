import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../contexts/CartContext';
import { AuthContext } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import checkoutService from '../../services/checkoutService';
import { toast } from 'react-toastify';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: currentUser?.firstName + ' ' + currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phoneNumber || '',
    address: '',
    city: '',
    district: '',
    ward: '',
    paymentMethod: 'COD',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Redirect if cart is empty
    if (!cartItems.length) {
      toast.info('Giỏ hàng của bạn đang trống.');
      navigate('/cart');
      return;
    }

    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [cartItems, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
    }
    
    if (!formData.district.trim()) {
      newErrors.district = 'Vui lòng chọn quận/huyện';
    }
    
    if (!formData.ward.trim()) {
      newErrors.ward = 'Vui lòng chọn phường/xã';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (activeStep === 1) {
      if (validateForm()) {
        setActiveStep(2);
        window.scrollTo(0, 0);
      }
    }
  };

  const handlePreviousStep = () => {
    setActiveStep(activeStep - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmitOrder = async () => {
    try {
      setLoading(true);
      
      // Format full address
      const fullAddress = `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.city}`;
      
      // Create the order data object
      const orderData = {
        customerInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: fullAddress
        },
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: getCartTotal(),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      };
      
      console.log("Submitting order:", orderData);
      
      // Submit the order using the checkout service
      const order = await checkoutService.createOrder(orderData);
      
      toast.success("Đặt hàng thành công!");
      
      // Clear the cart after successful order
      await clearCart();
      
      // Redirect to success page
      navigate(`/checkout/success/${order.id}`, { state: { orderNumber: order.orderNumber } });
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.message || 'Không thể hoàn tất đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <h1>Thanh toán</h1>
      
      {/* Checkout steps UI */}
      <div className="checkout-steps">
        <div className={`step ${activeStep === 1 ? 'active' : activeStep > 1 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-title">Thông tin giao hàng</div>
        </div>
        <div className="step-connector"></div>
        <div className={`step ${activeStep === 2 ? 'active' : activeStep > 2 ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-title">Xác nhận đơn hàng</div>
        </div>
      </div>
      
      <div className="checkout-content">
        {activeStep === 1 && (
          <div className="shipping-info">
            <h2>Thông tin giao hàng</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName">Họ và tên <span className="required">*</span></label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={errors.fullName ? 'error' : ''}
                />
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email <span className="required">*</span></label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Số điện thoại <span className="required">*</span></label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            </div>
            
            <h3>Địa chỉ giao hàng</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">Tỉnh/Thành phố <span className="required">*</span></label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={errors.city ? 'error' : ''}
                >
                  <option value="">-- Chọn Tỉnh/Thành phố --</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  {/* Add more cities */}
                </select>
                {errors.city && <span className="error-message">{errors.city}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="district">Quận/Huyện <span className="required">*</span></label>
                <select
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className={errors.district ? 'error' : ''}
                >
                  <option value="">-- Chọn Quận/Huyện --</option>
                  {formData.city === 'TP. Hồ Chí Minh' && (
                    <>
                      <option value="Quận 1">Quận 1</option>
                      <option value="Quận 2">Quận 2</option>
                      <option value="Quận 3">Quận 3</option>
                      {/* Add more districts for HCMC */}
                    </>
                  )}
                  {formData.city === 'Hà Nội' && (
                    <>
                      <option value="Quận Ba Đình">Quận Ba Đình</option>
                      <option value="Quận Hoàn Kiếm">Quận Hoàn Kiếm</option>
                      <option value="Quận Hai Bà Trưng">Quận Hai Bà Trưng</option>
                      {/* Add more districts for Hanoi */}
                    </>
                  )}
                </select>
                {errors.district && <span className="error-message">{errors.district}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="ward">Phường/Xã <span className="required">*</span></label>
                <select
                  id="ward"
                  name="ward"
                  value={formData.ward}
                  onChange={handleChange}
                  className={errors.ward ? 'error' : ''}
                >
                  <option value="">-- Chọn Phường/Xã --</option>
                  {/* Add wards based on selected district */}
                  <option value="Phường 1">Phường 1</option>
                  <option value="Phường 2">Phường 2</option>
                  <option value="Phường 3">Phường 3</option>
                </select>
                {errors.ward && <span className="error-message">{errors.ward}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address">Địa chỉ chi tiết <span className="required">*</span></label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={errors.address ? 'error' : ''}
                  placeholder="Số nhà, tên đường..."
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>
            </div>
            
            <h3>Phương thức thanh toán</h3>
            
            <div className="payment-methods">
              <div className="payment-method">
                <input
                  type="radio"
                  id="COD"
                  name="paymentMethod"
                  value="COD"
                  checked={formData.paymentMethod === 'COD'}
                  onChange={handleChange}
                />
                <label htmlFor="COD">
                  <div className="payment-logo cod-logo">
                    <i className="fas fa-money-bill-wave"></i>
                  </div>
                  <div className="payment-info">
                    <div className="payment-name">Thanh toán khi nhận hàng (COD)</div>
                    <div className="payment-description">Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng</div>
                  </div>
                </label>
              </div>
              
              <div className="payment-method">
                <input
                  type="radio"
                  id="bankTransfer"
                  name="paymentMethod"
                  value="BANK_TRANSFER"
                  checked={formData.paymentMethod === 'BANK_TRANSFER'}
                  onChange={handleChange}
                />
                <label htmlFor="bankTransfer">
                  <div className="payment-logo bank-logo">
                    <i className="fas fa-university"></i>
                  </div>
                  <div className="payment-info">
                    <div className="payment-name">Chuyển khoản ngân hàng</div>
                    <div className="payment-description">Thực hiện thanh toán vào tài khoản ngân hàng của chúng tôi</div>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="notes">Ghi chú đơn hàng (tùy chọn)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay địa điểm giao hàng chi tiết hơn..."
                ></textarea>
              </div>
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/cart')}
              >
                <i className="fas fa-arrow-left"></i> Quay lại giỏ hàng
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleNextStep}
              >
                Tiếp tục <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        )}
        
        {activeStep === 2 && (
          <div className="order-confirmation">
            <h2>Xác nhận đơn hàng</h2>
            
            <div className="confirmation-section">
              <h3>Thông tin giao hàng</h3>
              <div className="confirmation-details">
                <div className="detail-row">
                  <span className="detail-label">Họ tên:</span>
                  <span className="detail-value">{formData.fullName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{formData.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Số điện thoại:</span>
                  <span className="detail-value">{formData.phone}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Địa chỉ:</span>
                  <span className="detail-value">
                    {formData.address}, {formData.ward}, {formData.district}, {formData.city}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn-text"
                onClick={() => setActiveStep(1)}
              >
                <i className="fas fa-pen"></i> Chỉnh sửa
              </button>
            </div>
            
            <div className="confirmation-section">
              <h3>Phương thức thanh toán</h3>
              <div className="confirmation-details">
                <div className="detail-row">
                  <span className="detail-value">
                    {formData.paymentMethod === 'COD' 
                      ? 'Thanh toán khi nhận hàng (COD)' 
                      : 'Chuyển khoản ngân hàng'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn-text"
                onClick={() => setActiveStep(1)}
              >
                <i className="fas fa-pen"></i> Chỉnh sửa
              </button>
            </div>
            
            <div className="confirmation-section">
              <h3>Đơn hàng của bạn</h3>
              <div className="order-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="order-item">
                    <div className="order-item-image">
                      <img 
                        src={item.images && item.images.length > 0 ? item.images[0] : '/images/placeholder.jpg'} 
                        alt={item.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/placeholder.jpg';
                        }}
                      />
                    </div>
                    <div className="order-item-details">
                      <div className="order-item-title">{item.title}</div>
                      <div className="order-item-meta">
                        <span className="order-item-price">{formatCurrency(item.price)}</span>
                        <span className="order-item-quantity">x {item.quantity}</span>
                      </div>
                    </div>
                    <div className="order-item-total">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="order-summary">
              <div className="summary-row">
                <span>Tạm tính:</span>
                <span>{formatCurrency(getCartTotal())}</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển:</span>
                <span>Miễn phí</span>
              </div>
              <div className="summary-total">
                <span>Tổng cộng:</span>
                <span>{formatCurrency(getCartTotal())}</span>
              </div>
            </div>
            
            <div className="checkout-notes">
              <p>
                <i className="fas fa-info-circle"></i> Bằng cách nhấn nút "Đặt hàng", bạn đồng ý với điều khoản dịch vụ và chính sách bảo mật của chúng tôi.
              </p>
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handlePreviousStep}
              >
                <i className="fas fa-arrow-left"></i> Quay lại
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmitOrder}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <span>Đặt hàng</span>
                    <i className="fas fa-check"></i>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
