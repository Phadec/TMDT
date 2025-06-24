import { useState, useEffect } from "react";
import { 
  Search, 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Truck, 
  AlertTriangle,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Home,
  Settings,
  Loader2,
  Copy,
  Trash2
} from "lucide-react";
import { adminServices } from "~/api";
import axios from "axios";

function GHNOrderManagement() {
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
  if (typeof document !== 'undefined' && !document.getElementById('ghn-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'ghn-notification-styles';
    style.textContent = animationStyle;
    document.head.appendChild(style);
  }

  // State management
  const [activeTab, setActiveTab] = useState("single"); // single hoặc multiple
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  // Single order states
  const [singleOrderId, setSingleOrderId] = useState("");
  const [singleOrderData, setSingleOrderData] = useState(null);
  const [singleOrderStatus, setSingleOrderStatus] = useState("");

  // Multiple orders states
  const [multipleOrderIds, setMultipleOrderIds] = useState("");
  const [multipleOrdersData, setMultipleOrdersData] = useState([]);
  const [multipleOrdersStatus, setMultipleOrdersStatus] = useState("");

  // Định nghĩa trạng thái và chuyển đổi hợp lệ
  const ORDER_STATUSES = {
    READY_TO_PICK: "Sẵn sàng lấy hàng",
    PICKING: "Đang lấy hàng", 
    PICKED: "Đã lấy hàng",
    STORING: "Đang lưu kho",
    TRANSPORTING: "Đang vận chuyển",
    DELIVERING: "Đang giao hàng",
    DELIVERED: "Đã giao hàng",
    DELIVERY_FAIL: "Giao hàng thất bại",
    WAITING_TO_RETURN: "Chờ trả hàng",
    RETURN: "Trả hàng",
    RETURN_TRANSPORTING: "Đang vận chuyển trả hàng",
    RETURNING: "Đang trả hàng",
    RETURNED: "Đã trả hàng",
    RETURN_FAIL: "Trả hàng thất bại",
    CANCEL: "Đã hủy"
  };

  const VALID_TRANSITIONS = {
    READY_TO_PICK: ["PICKING", "CANCEL", "STORING"],
    PICKING: ["READY_TO_PICK", "PICKED", "CANCEL"],
    PICKED: ["STORING", "DELIVERING", "RETURN"],
    STORING: ["DELIVERING", "DELIVERED", "RETURN"],
    TRANSPORTING: ["STORING", "DELIVERING"],
    DELIVERING: ["DELIVERED", "DELIVERY_FAIL"],
    DELIVERY_FAIL: ["DELIVERING", "STORING", "WAITING_TO_RETURN"],
    WAITING_TO_RETURN: ["RETURN", "STORING"],
    RETURN: ["RETURN_TRANSPORTING", "RETURNING", "RETURNED"],
    RETURN_TRANSPORTING: ["RETURN", "RETURNING"],
    RETURNING: ["RETURNED", "RETURN_FAIL"],
    RETURNED: [],
    RETURN_FAIL: [],
    DELIVERED: [],
    CANCEL: []
  };

  // Function để hiển thị notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Lấy các trạng thái có thể chuyển đổi
  const getValidNextStatuses = (currentStatus) => {
    return VALID_TRANSITIONS[currentStatus] || [];
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    const statusConfig = {
      READY_TO_PICK: { color: "bg-yellow-500", icon: Package },
      PICKING: { color: "bg-blue-500", icon: Package },
      PICKED: { color: "bg-green-500", icon: CheckCircle },
      STORING: { color: "bg-purple-500", icon: Package },
      TRANSPORTING: { color: "bg-indigo-500", icon: Truck },
      DELIVERING: { color: "bg-orange-500", icon: Truck },
      DELIVERED: { color: "bg-green-600", icon: CheckCircle },
      DELIVERY_FAIL: { color: "bg-red-500", icon: XCircle },
      WAITING_TO_RETURN: { color: "bg-yellow-600", icon: Clock },
      RETURN: { color: "bg-gray-500", icon: RotateCcw },
      RETURN_TRANSPORTING: { color: "bg-gray-600", icon: Truck },
      RETURNING: { color: "bg-gray-700", icon: RotateCcw },
      RETURNED: { color: "bg-gray-800", icon: CheckCircle },
      RETURN_FAIL: { color: "bg-red-600", icon: XCircle },
      CANCEL: { color: "bg-red-700", icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.READY_TO_PICK;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm text-white rounded-full ${config.color}`}>
        <IconComponent size={14} />
        {ORDER_STATUSES[status] || status}
      </span>
    );
  };

  // Tìm kiếm đơn hàng đơn lẻ
  const handleSearchSingleOrder = async () => {
    if (!singleOrderId.trim()) {
      showNotification('Vui lòng nhập ID đơn hàng', 'error');
      return;
    }

    try {
      setLoading(true);
      console.log('Calling API with ID:', singleOrderId.trim());
      
      // Gọi API trực tiếp không qua adminServices để tránh lỗi authentication
      const response = await axios.get(`http://localhost:8080/api/v1/admin/orders/${singleOrderId.trim()}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response:', response);
      
      if (response.data && response.data.code === 200 && response.data.data) {
        const orderData = response.data.data;
        setSingleOrderData({
          id: orderData.id,
          orderCode: orderData.id,
          status: orderData.status || 'READY_TO_PICK',
          customerName: orderData.fullName || orderData.customer?.fullName || "Khách hàng ẩn danh",
          customerPhone: orderData.phone || orderData.customer?.phone || "Chưa có SĐT",
          customerEmail: orderData.customer?.email || "Chưa có email",
          totalAmount: orderData.fee || 0,
          productPrice: orderData.product?.price || 0,
          discount: orderData.discount || 0,
          paymentMethod: orderData.payment?.transaction || orderData.payment?.method || "COD",
          paymentStatus: orderData.payment?.status || "PENDING",
          shippingFromAddress: orderData.address?.from_address || "Chưa có địa chỉ gửi",
          shippingToAddress: orderData.address?.to_address || "Chưa có địa chỉ nhận",
          productName: orderData.product?.name || "Sản phẩm không xác định",
          productId: orderData.product?.id || "",
          createdAt: orderData.createdAt || orderData.payment?.createdAt,
          updatedAt: orderData.updatedAt,
          originalOrder: orderData
        });
        setSingleOrderStatus(orderData.status || 'READY_TO_PICK');
        showNotification('Tìm thấy đơn hàng thành công', 'success');
      } else {
        setSingleOrderData(null);
        showNotification('Không tìm thấy đơn hàng', 'error');
      }
    } catch (error) {
      console.error('Error searching order:', error);
      setSingleOrderData(null);
      
      if (error.response) {
        if (error.response.status === 401) {
          showNotification('Không có quyền truy cập API', 'error');
        } else if (error.response.status === 404) {
          showNotification('Không tìm thấy đơn hàng với ID: ' + singleOrderId.trim(), 'error');
        } else {
          showNotification(`Lỗi API: ${error.response.status}`, 'error');
        }
      } else {
        showNotification('Có lỗi xảy ra khi tìm kiếm đơn hàng', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Tìm kiếm nhiều đơn hàng
  const handleSearchMultipleOrders = async () => {
    if (!multipleOrderIds.trim()) {
      showNotification('Vui lòng nhập ID các đơn hàng', 'error');
      return;
    }

    const orderIds = multipleOrderIds.split(',').map(id => id.trim()).filter(id => id);
    
    if (orderIds.length === 0) {
      showNotification('Vui lòng nhập ID các đơn hàng hợp lệ', 'error');
      return;
    }

    // Reset previous data
    setMultipleOrdersData([]);
    setMultipleOrdersStatus("");

    try {
      setLoading(true);
      const orders = [];
      
      for (const orderId of orderIds) {
        try {
          const response = await axios.get(`http://localhost:8080/api/v1/admin/orders/${orderId}`, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          if (response.data && response.data.code === 200 && response.data.data) {
            const orderData = response.data.data;
            orders.push({
              id: orderData.id,
              orderCode: orderData.id,
              status: orderData.status || 'READY_TO_PICK',
              customerName: orderData.fullName || orderData.customer?.fullName || "Khách hàng ẩn danh",
              customerPhone: orderData.phone || orderData.customer?.phone || "Chưa có SĐT",
              customerEmail: orderData.customer?.email || "Chưa có email",
              totalAmount: orderData.fee || 0,
              productPrice: orderData.product?.price || 0,
              discount: orderData.discount || 0,
              paymentMethod: orderData.payment?.transaction || orderData.payment?.method || "COD",
              paymentStatus: orderData.payment?.status || "PENDING",
              shippingFromAddress: orderData.address?.from_address || "Chưa có địa chỉ gửi",
              shippingToAddress: orderData.address?.to_address || "Chưa có địa chỉ nhận",
              productName: orderData.product?.name || "Sản phẩm không xác định",
              productId: orderData.product?.id || "",
              createdAt: orderData.createdAt || orderData.payment?.createdAt,
              updatedAt: orderData.updatedAt,
              originalOrder: orderData
            });
          }
        } catch (error) {
          console.error(`Error fetching order ${orderId}:`, error);
        }
      }

      setMultipleOrdersData(orders);
      
      if (orders.length > 0) {
        showNotification(`Tìm thấy ${orders.length}/${orderIds.length} đơn hàng`, 'success');
      } else {
        showNotification('Không tìm thấy đơn hàng nào', 'error');
      }
    } catch (error) {
      console.error('Error searching multiple orders:', error);
      showNotification('Có lỗi xảy ra khi tìm kiếm đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật trạng thái đơn hàng đơn lẻ
  const handleUpdateSingleOrderStatus = async () => {
    if (!singleOrderData || !singleOrderStatus) {
      showNotification('Vui lòng chọn trạng thái mới', 'error');
      return;
    }

    try {
      setLoading(true);
      console.log('Updating order status:', singleOrderData.id, 'to:', singleOrderStatus);
      
      // Gọi API PUT trực tiếp với endpoint mới
      const response = await axios.put(
        `http://localhost:8080/api/v1/admin/orders/${singleOrderData.id}/status?status=${singleOrderStatus}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Update status response:', response);
      
      if (response.data && response.data.code === 200) {
        setSingleOrderData(prev => ({
          ...prev,
          status: singleOrderStatus,
          updatedAt: new Date().toISOString()
        }));
        showNotification('Đã cập nhật trạng thái đơn hàng thành công', 'success');
      } else {
        showNotification('Cập nhật thất bại', 'error');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      if (error.response) {
        if (error.response.status === 401) {
          showNotification('Không có quyền cập nhật trạng thái', 'error');
        } else if (error.response.status === 404) {
          showNotification('Không tìm thấy đơn hàng', 'error');
        } else {
          showNotification(`Lỗi API: ${error.response.status}`, 'error');
        }
      } else {
        showNotification('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật trạng thái nhiều đơn hàng
  const handleUpdateMultipleOrdersStatus = async () => {
    if (multipleOrdersData.length === 0 || !multipleOrdersStatus) {
      showNotification('Vui lòng chọn trạng thái mới', 'error');
      return;
    }

    try {
      setLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const order of multipleOrdersData) {
        try {
          console.log('Updating order status:', order.id, 'to:', multipleOrdersStatus);
          
          // Gọi API PUT trực tiếp với endpoint mới
          const response = await axios.put(
            `http://localhost:8080/api/v1/admin/orders/${order.id}/status?status=${multipleOrdersStatus}`,
            {},
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (response.data && response.data.code === 200) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`Error updating order ${order.id}:`, error);
          errorCount++;
        }
      }

      // Cập nhật state chỉ cho những đơn hàng thành công
      if (successCount > 0) {
        setMultipleOrdersData(prev => 
          prev.map(order => ({
            ...order,
            status: multipleOrdersStatus,
            updatedAt: new Date().toISOString()
          }))
        );
      }

      if (successCount > 0) {
        showNotification(`Đã cập nhật thành công ${successCount}/${multipleOrdersData.length} đơn hàng`, 'success');
      }
      if (errorCount > 0) {
        showNotification(`Có ${errorCount} đơn hàng cập nhật thất bại`, 'error');
      }
    } catch (error) {
      console.error('Error updating multiple orders status:', error);
      showNotification('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

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
      minute: '2-digit'
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

  // Clear single order form
  const clearSingleOrderForm = () => {
    setSingleOrderId("");
    setSingleOrderData(null);
    setSingleOrderStatus("");
  };

  // Clear multiple orders form
  const clearMultipleOrdersForm = () => {
    setMultipleOrderIds("");
    setMultipleOrdersData([]);
    setMultipleOrdersStatus("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg animate-fade-in ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            {notification.message}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-800 mb-6">GHN Order Management</h1>
            
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("single")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "single" 
                    ? "bg-blue-500 text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Package size={20} />
                <span className="hidden sm:inline">Đơn hàng</span>
              </button>
              
              <button
                onClick={() => setActiveTab("multiple")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "multiple" 
                    ? "bg-blue-500 text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Settings size={20} />
                <span className="hidden sm:inline">Xử lý nhiều đơn hàng</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === "single" && (
            <div className="animate-slide-in">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý đơn hàng</h2>
                
                {/* Search Section */}
                <div className="mb-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Đơn hàng
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        placeholder="Nhập ID đơn hàng..."
                        value={singleOrderId}
                        onChange={(e) => setSingleOrderId(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !loading && handleSearchSingleOrder()}
                        disabled={loading}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <button
                        onClick={handleSearchSingleOrder}
                        disabled={loading || !singleOrderId.trim()}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                      >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                      </button>
                      <button
                        onClick={clearSingleOrderForm}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                      >
                        <Trash2 size={18} />
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>

                {/* Empty State */}
                {!singleOrderData && !loading && singleOrderId && (
                  <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
                    <p className="text-gray-500">Vui lòng kiểm tra lại ID đơn hàng và thử lại.</p>
                  </div>
                )}

                {/* Order Details */}
                {singleOrderData && (
                  <div className="animate-fade-in">
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin đơn hàng</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Mã đơn hàng</p>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{singleOrderData.orderCode}</p>
                            <button
                              onClick={() => copyToClipboard(singleOrderData.orderCode)}
                              className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                              title="Sao chép mã đơn hàng"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Trạng thái hiện tại</p>
                          <div className="mt-1">
                            {renderStatusBadge(singleOrderData.status)}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Khách hàng</p>
                          <p className="font-semibold">{singleOrderData.customerName}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Số điện thoại</p>
                          <p className="font-semibold">{singleOrderData.customerPhone}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-semibold">{singleOrderData.customerEmail}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Sản phẩm</p>
                          <p className="font-semibold">{singleOrderData.productName}</p>
                          <p className="text-xs text-gray-500">ID: {singleOrderData.productId}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Giá sản phẩm</p>
                          <p className="font-semibold text-blue-600">{formatCurrency(singleOrderData.productPrice)}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Phí vận chuyển</p>
                          <p className="font-semibold text-orange-600">
                            {formatCurrency(Math.max(0, singleOrderData.totalAmount - singleOrderData.productPrice))}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Tổng tiền</p>
                          <p className="font-semibold text-green-600">{formatCurrency(singleOrderData.totalAmount)}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                          <p className="font-semibold">{singleOrderData.paymentMethod}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Trạng thái thanh toán</p>
                          <div className="mt-1">
                            {renderStatusBadge(singleOrderData.paymentStatus)}
                          </div>
                        </div>
                        
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-600">Địa chỉ gửi</p>
                          <p className="font-semibold">{singleOrderData.shippingFromAddress}</p>
                        </div>
                        
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-600">Địa chỉ nhận</p>
                          <p className="font-semibold">{singleOrderData.shippingToAddress}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Ngày tạo</p>
                          <p className="font-semibold">{formatDate(singleOrderData.createdAt || singleOrderData.originalOrder?.payment?.createdAt)}</p>
                        </div>
                        
                        {singleOrderData.updatedAt && (
                          <div>
                            <p className="text-sm text-gray-600">Cập nhật lần cuối</p>
                            <p className="font-semibold">{formatDate(singleOrderData.updatedAt)}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Update Section */}
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Cập nhật trạng thái</h3>
                      
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trạng thái mới
                          </label>
                          <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={singleOrderStatus}
                            onChange={(e) => setSingleOrderStatus(e.target.value)}
                          >
                            <option value="">Chọn trạng thái</option>
                            {getValidNextStatuses(singleOrderData.status).map(status => (
                              <option key={status} value={status}>
                                {ORDER_STATUSES[status]}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex items-end">
                          <button
                            onClick={handleUpdateSingleOrderStatus}
                            disabled={loading || !singleOrderStatus}
                            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                          >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                            {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "multiple" && (
            <div className="animate-slide-in">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Xử lý nhiều đơn hàng</h2>
                
                {/* Search Section */}
                <div className="mb-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Đơn hàng (ngăn cách bởi dấu phẩy)
                      </label>
                      <textarea
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        placeholder="Nhập ID các đơn hàng, ngăn cách bởi dấu phẩy. Ví dụ: 68596b01ac2384dccf06d02c, 68596b01ac2384dccf06d02d"
                        rows="3"
                        value={multipleOrderIds}
                        onChange={(e) => setMultipleOrderIds(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <button
                        onClick={handleSearchMultipleOrders}
                        disabled={loading || !multipleOrderIds.trim()}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                      >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                      </button>
                      <button
                        onClick={clearMultipleOrdersForm}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                      >
                        <Trash2 size={18} />
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>

                {/* Empty State */}
                {multipleOrdersData.length === 0 && !loading && multipleOrderIds && (
                  <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đơn hàng nào</h3>
                    <p className="text-gray-500">Vui lòng kiểm tra lại ID các đơn hàng và thử lại.</p>
                  </div>
                )}

                {/* Orders List */}
                {multipleOrdersData.length > 0 && (
                  <div className="animate-fade-in">
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Danh sách đơn hàng ({multipleOrdersData.length})
                      </h3>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Mã đơn hàng</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Khách hàng</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Sản phẩm</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Trạng thái đơn hàng</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Trạng thái thanh toán</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tổng tiền</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ngày tạo</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {multipleOrdersData.map((order, index) => (
                              <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  {order.orderCode}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  <div>
                                    <p className="font-medium">{order.customerName}</p>
                                    <p className="text-gray-500">{order.customerPhone}</p>
                                    <p className="text-gray-400 text-xs">{order.customerEmail}</p>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  <div>
                                    <p className="font-medium">{order.productName}</p>
                                    <p className="text-gray-500 text-xs">ID: {order.productId}</p>
                                    <p className="text-blue-600 text-xs">{formatCurrency(order.productPrice)}</p>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {renderStatusBadge(order.status)}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {renderStatusBadge(order.paymentStatus)}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-green-600">
                                  {formatCurrency(order.totalAmount)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {formatDate(order.createdAt || order.originalOrder?.payment?.createdAt)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Bulk Status Update Section */}
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Cập nhật trạng thái hàng loạt</h3>
                      
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trạng thái mới cho tất cả đơn hàng
                          </label>
                          <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={multipleOrdersStatus}
                            onChange={(e) => setMultipleOrdersStatus(e.target.value)}
                          >
                            <option value="">Chọn trạng thái</option>
                            {Object.entries(ORDER_STATUSES).map(([key, value]) => (
                              <option key={key} value={key}>
                                {value}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex items-end">
                          <button
                            onClick={handleUpdateMultipleOrdersStatus}
                            disabled={loading || !multipleOrdersStatus}
                            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                          >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                            {loading ? 'Đang cập nhật...' : `Cập nhật ${multipleOrdersData.length} đơn hàng`}
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle size={20} className="text-yellow-600 mt-0.5" />
                          <div className="text-sm text-yellow-800">
                            <p className="font-medium">Lưu ý:</p>
                            <p>Việc cập nhật trạng thái hàng loạt sẽ áp dụng cho tất cả {multipleOrdersData.length} đơn hàng được tìm thấy. Vui lòng kiểm tra kỹ trước khi thực hiện.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GHNOrderManagement;