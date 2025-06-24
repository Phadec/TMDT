import { useState, useEffect } from "react";
import { 
  Package, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Calendar,
  DollarSign,
  Truck,
  CheckCircle,
  AlertCircle,
  Copy,
  ArrowLeft
} from "lucide-react";
import { adminServices } from "~/api";

function GHNOrderDetail() {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // ID đơn hàng cố định theo yêu cầu
  const ORDER_ID = "68596b01ac2384dccf06d02c";

  // CSS cho animation
  const animationStyle = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }
  `;

  // Thêm style vào head
  if (typeof document !== 'undefined' && !document.getElementById('ghn-order-detail-styles')) {
    const style = document.createElement('style');
    style.id = 'ghn-order-detail-styles';
    style.textContent = animationStyle;
    document.head.appendChild(style);
  }

  // Function để hiển thị notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Lấy thông tin đơn hàng
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching order with ID:', ORDER_ID);
        console.log('Admin token:', localStorage.getItem('adminToken'));
        
        const response = await adminServices.orders.getById(ORDER_ID);
        
        console.log('API Response:', response);
        
        if (response) {
          setOrderData(response);
        } else {
          setError('Không tìm thấy đơn hàng');
        }
      } catch (err) {
        console.error('Error fetching order detail:', err);
        console.error('Error details:', {
          status: err.status,
          message: err.message,
          data: err.data
        });
        
        if (err.status === 401) {
          setError('Không có quyền truy cập. Vui lòng đăng nhập admin.');
        } else if (err.status === 404) {
          setError('Không tìm thấy đơn hàng với ID: ' + ORDER_ID);
        } else {
          setError(err.message || 'Có lỗi xảy ra khi tải thông tin đơn hàng');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, []);

  // Format tiền tệ
  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "0 ₫";
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  // Copy to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification('Đã sao chép vào clipboard', 'success');
    } catch (err) {
      showNotification('Không thể sao chép', 'error');
    }
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    const statusConfig = {
      DELIVERED: { color: "bg-green-600 text-white", icon: CheckCircle, text: "Đã giao hàng" },
      PENDING: { color: "bg-yellow-500 text-white", icon: AlertCircle, text: "Đang chờ" },
      PROCESSING: { color: "bg-blue-500 text-white", icon: Package, text: "Đang xử lý" },
      SHIPPING: { color: "bg-indigo-500 text-white", icon: Truck, text: "Đang giao hàng" },
      CANCELLED: { color: "bg-red-500 text-white", icon: AlertCircle, text: "Đã hủy" }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full ${config.color}`}>
        <IconComponent size={16} />
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
          <p className="text-gray-600">Đơn hàng với ID {ORDER_ID} không tồn tại</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg animate-fade-in ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.history.back()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Chi tiết đơn hàng</h1>
                <p className="text-sm text-gray-600">ID: {orderData.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {renderStatusBadge(orderData.status)}
              <button
                onClick={() => copyToClipboard(orderData.id)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sao chép ID đơn hàng"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                Thông tin khách hàng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Họ tên</p>
                      <p className="font-medium">{orderData.fullName || 'Chưa có'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Số điện thoại</p>
                      <p className="font-medium">{orderData.phone || 'Chưa có'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{orderData.customer?.email || 'Chưa có'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">ID khách hàng</p>
                      <p className="font-medium text-xs">{orderData.customer?.id || 'Chưa có'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package size={20} className="text-green-600" />
                Thông tin sản phẩm
              </h2>
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{orderData.product?.name || 'Sản phẩm không xác định'}</h3>
                  <span className="text-lg font-semibold text-green-600">
                    {formatCurrency(orderData.product?.price)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">ID sản phẩm: {orderData.product?.id || 'Chưa có'}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-red-600" />
                Địa chỉ giao hàng
              </h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm font-medium text-gray-900">Địa chỉ gửi</p>
                  <p className="text-gray-700">{orderData.address?.from_address || 'Chưa có địa chỉ gửi'}</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="text-sm font-medium text-gray-900">Địa chỉ nhận</p>
                  <p className="text-gray-700">{orderData.address?.to_address || 'Chưa có địa chỉ nhận'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment & Summary */}
          <div className="space-y-6">
            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-purple-600" />
                Thông tin thanh toán
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức</span>
                  <span className="font-medium">{orderData.payment?.transaction || orderData.payment?.method || 'COD'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái thanh toán</span>
                  <span className={`font-medium ${
                    orderData.payment?.status === 'DELIVERED' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {orderData.payment?.status || 'PENDING'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày tạo</span>
                  <span className="font-medium text-sm">{formatDate(orderData.payment?.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-green-600" />
                Tổng kết đơn hàng
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá sản phẩm</span>
                  <span className="font-medium">{formatCurrency(orderData.product?.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-medium">{formatCurrency(orderData.fee)}</span>
                </div>
                {orderData.discount && (
                  <div className="flex justify-between text-red-600">
                    <span>Giảm giá</span>
                    <span className="font-medium">-{formatCurrency(orderData.discount)}</span>
                  </div>
                )}
                <hr className="my-3" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Tổng cộng</span>
                  <span className="text-green-600">{formatCurrency(orderData.fee)}</span>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-blue-600" />
                Thời gian
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày tạo đơn</span>
                  <span className="font-medium text-sm">{formatDate(orderData.createdAt || orderData.payment?.createdAt)}</span>
                </div>
                {orderData.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cập nhật lần cuối</span>
                    <span className="font-medium text-sm">{formatDate(orderData.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Raw Data Section (for debugging) */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dữ liệu gốc (JSON)</h2>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96">
              {JSON.stringify(orderData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GHNOrderDetail;