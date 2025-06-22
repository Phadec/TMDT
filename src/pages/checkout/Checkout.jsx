import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  CreditCardIcon, 
  MapPinIcon, 
  UserIcon, 
  PhoneIcon,
  EnvelopeIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/solid";
import Swal from 'sweetalert2';
import { apiServices } from "~/api";
import { useCart } from "~/contexts/CartContext";

function Checkout() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { clearCart } = useCart();
  
  // State cho giỏ hàng
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // State cho địa chỉ GHN
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  
  // State cho thông tin thanh toán
  const [checkoutData, setCheckoutData] = useState({
    // Thông tin giao hàng
    fullName: '',
    email: '',
    phone: '',
    address: '',
    provinceId: '',
    provinceName: '',
    districtId: '',
    districtName: '',
    wardCode: '',
    wardName: '',
    note: '',
    
    // Phương thức thanh toán
    paymentMethod: 'cod', // cod, bank_transfer, credit_card
    
    // Thông tin thẻ tín dụng (nếu chọn)
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  // Lấy thông tin user từ localStorage và điền vào form
  useEffect(() => {
    const loadUserDataFromStorage = () => {
      try {
        // Lấy thông tin từ localStorage với key 'userData'
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          
          // Điền thông tin từ localStorage vào form checkout
          setCheckoutData(prev => ({
            ...prev,
            fullName: userData?.fullname || userData?.name || userData?.fullName || '',
            email: userData?.email || '',
            phone: userData?.phone || '',
            address: userData?.address || (Array.isArray(userData?.addresses) ? userData.addresses.join(', ') : userData?.addresses || ''),
            provinceId: userData?.provinceId || '',
            provinceName: userData?.provinceName || '',
            districtId: userData?.districtId || '',
            districtName: userData?.districtName || '',
            wardCode: userData?.wardCode || '',
            wardName: userData?.wardName || '',
          }));
        }
      } catch (error) {
        console.error('Error loading user data from localStorage:', error);
      }
    };

    // Gọi hàm load dữ liệu khi component mount
    loadUserDataFromStorage();

    // Lắng nghe sự kiện focus để cập nhật dữ liệu khi user quay lại trang
    const handleFocus = () => {
      loadUserDataFromStorage();
    };

    window.addEventListener('focus', handleFocus);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Cập nhật thông tin user khi user từ Redux thay đổi (fallback)
  useEffect(() => {
    if (user && (!checkoutData.fullName && !checkoutData.email && !checkoutData.phone)) {
      setCheckoutData(prev => ({
        ...prev,
        fullName: user?.fullName || user?.name || prev.fullName,
        email: user?.email || prev.email,
        phone: user?.phone || prev.phone,
        address: user?.address || (Array.isArray(user?.addresses) ? user.addresses.join(', ') : user?.addresses || prev.address),
        provinceId: user?.provinceId || prev.provinceId,
        provinceName: user?.provinceName || prev.provinceName,
        districtId: user?.districtId || prev.districtId,
        districtName: user?.districtName || prev.districtName,
        wardCode: user?.wardCode || prev.wardCode,
        wardName: user?.wardName || prev.wardName,
      }));
    }
  }, [user, checkoutData.fullName, checkoutData.email, checkoutData.phone]);

  // Lấy dữ liệu sản phẩm đã chọn từ cart
  useEffect(() => {
    const fetchSelectedItems = async () => {
      try {
        // Lấy sản phẩm đã chọn từ localStorage
        const selectedItemsData = localStorage.getItem('selectedCheckoutItems');
        
        if (selectedItemsData) {
          const selectedProducts = JSON.parse(selectedItemsData);
          if (Array.isArray(selectedProducts) && selectedProducts.length > 0) {
            setCartItems(selectedProducts);
          } else {
            // Nếu không có sản phẩm đã chọn, quay về cart
            Swal.fire({
              icon: 'warning',
              title: 'Không có sản phẩm được chọn',
              text: 'Vui lòng chọn sản phẩm từ giỏ hàng để thanh toán.',
              confirmButtonText: 'Quay lại giỏ hàng'
            }).then(() => {
              navigate('/cart');
            });
          }
        } else {
          // Nếu không có dữ liệu, quay về cart
          Swal.fire({
            icon: 'warning',
            title: 'Không có sản phẩm được chọn',
            text: 'Vui lòng chọn sản phẩm từ giỏ hàng để thanh toán.',
            confirmButtonText: 'Quay lại giỏ hàng'
          }).then(() => {
            navigate('/cart');
          });
        }
      } catch (error) {
        console.error('Error loading selected items:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Không thể tải thông tin sản phẩm đã chọn.',
          confirmButtonText: 'Quay lại giỏ hàng'
        }).then(() => {
          navigate('/cart');
        });
      } finally {
        setLoading(false);
      }
    };

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchSelectedItems();
  }, [isAuthenticated, navigate]);

  // Tính tổng tiền
  const totalAmount = cartItems.reduce((total, item) => total + Number(item.price || 0), 0);
  const shippingFee = totalAmount > 500000 ? 0 : 30000; // Miễn phí ship cho đơn hàng trên 500k
  const finalAmount = totalAmount + shippingFee;

  // API GHN functions
  const fetchProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const response = await fetch('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      if (data.code === 200) {
        setProvinces(data.data);
      }
    } catch (error) {
      console.error('Error fetching provinces:', error);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const fetchDistricts = async (provinceId) => {
    try {
      setLoadingDistricts(true);
      const response = await fetch('https://online-gateway.ghn.vn/shiip/public-api/master-data/district', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          province_id: parseInt(provinceId)
        })
      });
      const data = await response.json();
      if (data.code === 200) {
        setDistricts(data.data);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const fetchWards = async (districtId) => {
    try {
      setLoadingWards(true);
      const response = await fetch('https://online-gateway.ghn.vn/shiip/public-api/master-data/ward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          district_id: parseInt(districtId)
        })
      });
      const data = await response.json();
      if (data.code === 200) {
        setWards(data.data);
      }
    } catch (error) {
      console.error('Error fetching wards:', error);
    } finally {
      setLoadingWards(false);
    }
  };

  // Load provinces khi component mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Load districts khi có provinceId
  useEffect(() => {
    if (checkoutData.provinceId && provinces.length > 0) {
      fetchDistricts(checkoutData.provinceId);
    }
  }, [checkoutData.provinceId, provinces.length]);

  // Load wards khi có districtId
  useEffect(() => {
    if (checkoutData.districtId && districts.length > 0) {
      fetchWards(checkoutData.districtId);
    }
  }, [checkoutData.districtId, districts.length]);

  // Cập nhật thông tin trong localStorage (tùy chọn)
  const updateUserDataInStorage = (field, value) => {
    try {
      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        
        // Mapping field names để phù hợp với cấu trúc userData
        const fieldMapping = {
          'fullName': 'fullname',
          'phone': 'phone',
          'address': 'address'
        };
        
        const storageField = fieldMapping[field] || field;
        userData[storageField] = value;
        
        localStorage.setItem('userData', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error updating user data in localStorage:', error);
    }
  };

  // Xử lý thay đổi input
  const handleInputChange = (field, value, additionalData = {}) => {
    setCheckoutData(prev => {
      const newData = {
        ...prev,
        [field]: value,
        ...additionalData
      };
      
      // Tự động điền tên trên thẻ khi chọn phương thức thanh toán bằng thẻ tín dụng
      if (field === 'paymentMethod' && value === 'credit_card' && !prev.cardName && prev.fullName) {
        newData.cardName = prev.fullName.toUpperCase();
      }
      
      // Xử lý khi thay đổi tỉnh/thành phố
      if (field === 'provinceId' && value) {
        // Reset district và ward khi thay đổi province
        newData.districtId = '';
        newData.districtName = '';
        newData.wardCode = '';
        newData.wardName = '';
        setDistricts([]);
        setWards([]);
        // Fetch districts cho province mới
        fetchDistricts(value);
      }
      
      // Xử lý khi thay đổi quận/huyện
      if (field === 'districtId' && value) {
        // Reset ward khi thay đổi district
        newData.wardCode = '';
        newData.wardName = '';
        setWards([]);
        // Fetch wards cho district mới
        fetchWards(value);
      }
      
      // Cập nhật thông tin quan trọng vào localStorage (tùy chọn)
      if (['fullName', 'phone', 'address'].includes(field) && value.trim()) {
        updateUserDataInStorage(field, value.trim());
      }
      
      return newData;
    });
  };

  // Validate form
  const validateForm = () => {
    const required = ['fullName', 'email', 'phone', 'address'];
    for (let field of required) {
      if (!checkoutData[field] || (typeof checkoutData[field] === 'string' && !checkoutData[field].trim())) {
        return false;
      }
    }
    
    if (checkoutData.paymentMethod === 'credit_card') {
      const cardRequired = ['cardNumber', 'cardName', 'expiryDate', 'cvv'];
      for (let field of cardRequired) {
        if (!checkoutData[field].trim()) {
          return false;
        }
      }
    }
    
    return true;
  };

  // Xử lý đặt hàng
  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      navigate('/account');
      return;
    }

    try {
      setSubmitting(true);
      
      // Tạo đơn hàng
      const orderData = {
        items: cartItems,
        shippingInfo: {
          fullName: checkoutData.fullName,
          email: checkoutData.email,
          phone: checkoutData.phone,
          address: checkoutData.address,
          provinceId: checkoutData.provinceId,
          provinceName: checkoutData.provinceName,
          districtId: checkoutData.districtId,
          districtName: checkoutData.districtName,
          wardCode: checkoutData.wardCode,
          wardName: checkoutData.wardName,
          note: checkoutData.note
        },
        paymentMethod: checkoutData.paymentMethod,
        totalAmount: finalAmount,
        shippingFee: shippingFee
      };

      // Gọi API tạo đơn hàng (giả lập)
      // const response = await apiServices.order.createOrder(orderData);
      
      // Giả lập thành công
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Xóa giỏ hàng
      await clearCart();
      
      // Hiển thị thông báo thành công
      Swal.fire({
        icon: 'success',
        title: 'Đặt hàng thành công!',
        text: 'Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất.',
        confirmButtonText: 'Về trang chủ'
      }).then(() => {
        navigate('/');
      });
      
    } catch (error) {
      console.error('Error creating order:', error);
      Swal.fire({
        icon: 'error',
        title: 'Đặt hàng thất bại',
        text: 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Đang tải thông tin...</span>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Giỏ hàng trống</h3>
          <p className="text-gray-500 mb-4">Không có sản phẩm nào để thanh toán</p>
          <button 
            onClick={() => navigate('/products')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Quay lại giỏ hàng
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
          <p className="text-gray-600 mt-2">Vui lòng điền đầy đủ thông tin để hoàn tất đơn hàng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form thông tin */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thông tin giao hàng */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MapPinIcon className="w-6 h-6 text-purple-600 mr-2" />
                Thông tin giao hàng
              </h2>
              
              {/* Thông báo thông tin tự động điền */}
              {(checkoutData.fullName || checkoutData.email || checkoutData.phone) && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Thông tin cá nhân đã được tự động điền từ tài khoản của bạn. Bạn có thể chỉnh sửa nếu cần.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={checkoutData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <div className="relative">
                    <PhoneIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={checkoutData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={checkoutData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Nhập địa chỉ email"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ *
                  </label>
                  <input
                    type="text"
                    value={checkoutData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Số nhà, tên đường"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={checkoutData.note}
                    onChange={(e) => handleInputChange('note', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ghi chú thêm cho đơn hàng (tùy chọn)"
                  />
                </div>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCardIcon className="w-6 h-6 text-purple-600 mr-2" />
                Phương thức thanh toán
              </h2>
              
              <div className="space-y-4">
                {/* COD */}
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={checkoutData.paymentMethod === 'cod'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">Thanh toán khi nhận hàng (COD)</div>
                    <div className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</div>
                  </div>
                </label>
                
                {/* Chuyển khoản */}
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={checkoutData.paymentMethod === 'bank_transfer'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">Chuyển khoản ngân hàng</div>
                    <div className="text-sm text-gray-500">Chuyển khoản trước khi giao hàng</div>
                  </div>
                </label>
                
                {/* Thẻ tín dụng */}
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={checkoutData.paymentMethod === 'credit_card'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">Thẻ tín dụng/ghi nợ</div>
                    <div className="text-sm text-gray-500">Thanh toán online bằng thẻ</div>
                  </div>
                </label>
              </div>
              
              {/* Form thẻ tín dụng */}
              {checkoutData.paymentMethod === 'credit_card' && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số thẻ *
                      </label>
                      <input
                        type="text"
                        value={checkoutData.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên trên thẻ *
                      </label>
                      <input
                        type="text"
                        value={checkoutData.cardName}
                        onChange={(e) => handleInputChange('cardName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="NGUYEN VAN A"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày hết hạn *
                      </label>
                      <input
                        type="text"
                        value={checkoutData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="MM/YY"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={checkoutData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
              
              {/* Danh sách sản phẩm */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item, index) => (
                  <div key={`${item.productId}-${index}`} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <ShoppingBagIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</h4>
                      <p className="text-sm text-purple-600 font-semibold">
                        {Number(item.price).toLocaleString('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                          minimumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Tính toán */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính ({cartItems.length} sản phẩm)</span>
                  <span className="font-medium">
                    {totalAmount.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      minimumFractionDigits: 0,
                    })}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className={`font-medium ${shippingFee === 0 ? 'text-green-600' : ''}`}>
                    {shippingFee === 0 ? 'Miễn phí' : shippingFee.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      minimumFractionDigits: 0,
                    })}
                  </span>
                </div>
                
                {shippingFee === 0 && (
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                    🎉 Miễn phí vận chuyển cho đơn hàng trên 500.000đ
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Tổng cộng</span>
                    <span className="text-lg font-bold text-purple-600">
                      {finalAmount.toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        minimumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Nút đặt hàng */}
              <button
                onClick={handleSubmitOrder}
                disabled={submitting}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Đặt hàng ngay
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-3">
                Bằng cách đặt hàng, bạn đồng ý với{' '}
                <a href="/policy" className="text-purple-600 hover:underline">
                  Điều khoản sử dụng
                </a>{' '}
                của chúng tôi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;