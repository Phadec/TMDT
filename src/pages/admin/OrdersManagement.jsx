import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Truck, 
  Package,
  User,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import { adminServices } from "~/api";

function OrdersManagement() {
  // CSS cho animation
  const animationStyle = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
  `;

  // Thêm style vào head
  if (typeof document !== 'undefined' && !document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = animationStyle;
    document.head.appendChild(style);
  }

  // State cho danh sách đơn hàng
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);
  const [notification, setNotification] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 10
  });

  // Function để hiển thị notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Lấy dữ liệu từ API
  useEffect(() => {
    fetchOrders();
  }, [pagination.currentPage, pagination.size]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminServices.orders.getAll(pagination.currentPage, pagination.size);
      
      if (response && (response.content || response.data)) {
        const ordersData = response.content || response.data || [];
        console.log('Orders Response:', response);
        console.log('Orders Data:', ordersData);
        
        // Map backend data to frontend format
        const mappedOrders = ordersData.map(order => ({
          id: order.id,
          orderCode: order.id, // Sử dụng ID làm mã đơn hàng
          customerName: order.fullName || order.customer?.fullName || "Khách hàng ẩn danh",
          customerEmail: order.customer?.email || "Chưa có email",
          customerPhone: order.phone || order.customer?.phone || "Chưa có SĐT",
          totalAmount: order.fee || 0,
          status: order.status?.toLowerCase() || "pending",
          paymentMethod: order.payment?.method || order.payment?.transaction || "COD",
          paymentStatus: order.payment?.status?.toLowerCase() || "pending",
          shippingFromAddress: order.address?.from_address || "Chưa có địa chỉ gửi",
          shippingToAddress: order.address?.to_address || "Chưa có địa chỉ nhận",
          productName: order.product?.name || "Sản phẩm không xác định",
          productPrice: parseInt(order.product?.price) || 0,
          discount: order.discount,
          createdAt: order.createdAt || order.payment?.createdAt,
          updatedAt: order.updatedAt,
          // Thông tin gốc để debug
          originalOrder: order
        }));
        
        setOrders(mappedOrders);
        setPagination(prev => ({
          ...prev,
          totalPages: response.totalPages || response.data?.totalPages || 1,
          totalElements: response.totalElements || response.data?.totalElements || ordersData.length
        }));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to dummy data for development
      const dummyOrders = Array(20).fill().map((_, index) => ({
        id: String(index + 1).padStart(6, '0'),
        orderCode: String(index + 1).padStart(6, '0'),
        customerName: `Khách hàng ${index + 1}`,
        customerEmail: `customer${index + 1}@example.com`,
        customerPhone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
        totalAmount: Math.floor(Math.random() * 5000000) + 100000,
        status: ["pending", "confirmed", "ready_to_pick", "picked_up", "in_transit", "delivered", "cancelled"][Math.floor(Math.random() * 7)],
        paymentMethod: ["COD", "vnpay", "momo"][Math.floor(Math.random() * 3)],
        paymentStatus: ["pending", "paid", "failed"][Math.floor(Math.random() * 3)],
        productName: `Sản phẩm mẫu ${index + 1}`,
        productPrice: Math.floor(Math.random() * 1000000) + 50000,
        shippingFromAddress: `${Math.floor(Math.random() * 999) + 1} Đường ABC, Quận ${Math.floor(Math.random() * 12) + 1}, TP.HCM`,
        shippingToAddress: `${Math.floor(Math.random() * 999) + 1} Đường XYZ, Quận ${Math.floor(Math.random() * 12) + 1}, TP.HCM`,
        discount: Math.random() > 0.7 ? { code: "NEWUSER10" } : null,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      setOrders(dummyOrders);
      setPagination(prev => ({
        ...prev,
        totalPages: Math.ceil(dummyOrders.length / prev.size),
        totalElements: dummyOrders.length
      }));
      
      showNotification('Đang sử dụng dữ liệu mẫu. Vui lòng kiểm tra kết nối API.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Lọc đơn hàng theo trạng thái
  const filteredOrders = orders.filter(order => {
    if (currentFilter === "all") return true;
    return order.status === currentFilter;
  }).filter(order => {
    if (!searchTerm) return true;
    return order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
           order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
           order.customerPhone.includes(searchTerm);
  });

  // Xử lý xem chi tiết đơn hàng
  const handleViewOrder = async (order) => {
    try {
      setLoadingOrderDetail(true);
      setShowOrderDetail(true);
      setSelectedOrder(order);
      
      // Gọi API để lấy thêm chi tiết
      try {
        const detailResponse = await adminServices.orders.getById(order.id);
        const detailData = detailResponse.data || detailResponse;
        
        // Cập nhật thông tin chi tiết nếu có
        const detailedOrder = {
          ...order,
          // Cập nhật các trường từ API detail nếu có
          items: detailData.orderItems || detailData.items || order.items,
          notes: detailData.notes || order.notes,
          shippingAddress: detailData.shippingAddress || detailData.address || order.shippingAddress,
          // Giữ nguyên thông tin đã map từ danh sách
          originalOrder: detailData
        };
        
        setSelectedOrder(detailedOrder);
      } catch (detailError) {
        console.log('Could not fetch detailed info, using basic info:', detailError);
        // Vẫn hiển thị với thông tin cơ bản
      }
      
    } catch (error) {
      console.error('Error fetching order details:', error);
      setSelectedOrder(order);
      showNotification('Không thể tải đầy đủ thông tin chi tiết. Hiển thị thông tin cơ bản.', 'error');
    } finally {
      setLoadingOrderDetail(false);
    }
  };

  // Xử lý cập nhật trạng thái đơn hàng
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await adminServices.orders.updateStatus(orderId, newStatus);
      
      // Cập nhật state local
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      ));
      
      // Cập nhật selected order nếu đang xem chi tiết
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ 
          ...prev, 
          status: newStatus, 
          updatedAt: new Date().toISOString() 
        }));
      }
      
      showNotification('Đã cập nhật trạng thái đơn hàng thành công', 'success');
    } catch (error) {
      console.error('Error updating order status:', error);
      showNotification('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng', 'error');
    }
  };

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  // Format tiền tệ
  const formatCurrency = (amount) => {
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

  // Hiển thị trạng thái đơn hàng
  const renderOrderStatus = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500", text: "Chờ xác nhận", icon: Clock },
      confirmed: { color: "bg-blue-500", text: "Đã xác nhận", icon: CheckCircle },
      processing: { color: "bg-indigo-500", text: "Đang xử lý", icon: Package },
      shipping: { color: "bg-purple-500", text: "Đang giao", icon: Truck },
      delivered: { color: "bg-green-500", text: "Đã giao", icon: CheckCircle },
      cancelled: { color: "bg-red-500", text: "Đã hủy", icon: XCircle },
      ready_to_pick: { color: "bg-orange-500", text: "Sẵn sàng lấy hàng", icon: Package },
      picked_up: { color: "bg-blue-600", text: "Đã lấy hàng", icon: Truck },
      in_transit: { color: "bg-purple-600", text: "Đang vận chuyển", icon: Truck }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs text-white rounded-full ${config.color}`}>
        <IconComponent size={12} />
        {config.text}
      </span>
    );
  };

  // Hiển thị trạng thái thanh toán
  const renderPaymentStatus = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return <span className="px-2 py-1 text-xs text-white bg-green-500 rounded-full">Đã thanh toán</span>;
      case "pending":
        return <span className="px-2 py-1 text-xs text-white bg-yellow-500 rounded-full">Chờ thanh toán</span>;
      case "unpaid":
        return <span className="px-2 py-1 text-xs text-white bg-red-500 rounded-full">Chưa thanh toán</span>;
      case "refunded":
        return <span className="px-2 py-1 text-xs text-white bg-gray-500 rounded-full">Đã hoàn tiền</span>;
      case "failed":
        return <span className="px-2 py-1 text-xs text-white bg-red-600 rounded-full">Thất bại</span>;
      default:
        return <span className="px-2 py-1 text-xs text-white bg-gray-400 rounded-full">{status || "Không rõ"}</span>;
    }
  };

  return (
    <div>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg animate-fade-in ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Thanh công cụ */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Tìm kiếm đơn hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={currentFilter}
            onChange={(e) => setCurrentFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="ready_to_pick">Sẵn sàng lấy hàng</option>
            <option value="picked_up">Đã lấy hàng</option>
            <option value="in_transit">Đang vận chuyển</option>
            <option value="delivered">Đã giao</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <span className="text-sm text-gray-500">
            Hiển thị {filteredOrders.length} / {orders.length} đơn hàng
          </span>
        </div>
      </div>

      {/* Bảng danh sách đơn hàng */}
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Thanh toán
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Ngày tạo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-solid rounded-full animate-spin border-t-transparent"></div>
                      <span className="ml-2">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewOrder(order)}
                    title="Click để xem chi tiết"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{order.orderCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                        <div className="text-sm text-gray-500">{order.customerPhone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{order.productName}</div>
                        <div className="text-sm text-gray-500">Giá: {formatCurrency(order.productPrice)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </div>
                      <div className="text-sm text-gray-500">{order.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderOrderStatus(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderPaymentStatus(order.paymentStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 bg-gray-50">
            <div className="text-sm text-gray-500">
              Hiển thị {pagination.currentPage * pagination.size + 1} - {Math.min((pagination.currentPage + 1) * pagination.size, pagination.totalElements)} trong tổng số {pagination.totalElements} đơn hàng
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 0}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Trước
              </button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = pagination.currentPage < 3 ? i : pagination.currentPage - 2 + i;
                if (pageNum >= pagination.totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 text-sm border rounded ${
                      pageNum === pagination.currentPage
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages - 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal chi tiết đơn hàng */}
      {showOrderDetail && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                Chi tiết đơn hàng {selectedOrder.orderCode}
              </h2>
              <button
                onClick={() => setShowOrderDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            {loadingOrderDetail ? (
              <div className="flex items-center justify-center p-8">
                <div className="w-8 h-8 border-2 border-indigo-600 border-solid rounded-full animate-spin border-t-transparent"></div>
                <span className="ml-2">Đang tải chi tiết...</span>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Thông tin đơn hàng */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Package size={20} />
                      Thông tin đơn hàng
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mã đơn hàng:</span>
                        <span className="font-medium">{selectedOrder.orderCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trạng thái:</span>
                        {renderOrderStatus(selectedOrder.status)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thanh toán:</span>
                        {renderPaymentStatus(selectedOrder.paymentStatus)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phương thức:</span>
                        <span className="font-medium">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng tiền:</span>
                        <span className="font-bold text-lg text-green-600">
                          {formatCurrency(selectedOrder.totalAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày tạo:</span>
                        <span className="font-medium">{formatDate(selectedOrder.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cập nhật:</span>
                        <span className="font-medium">{formatDate(selectedOrder.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin khách hàng */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <User size={20} />
                      Thông tin khách hàng
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span className="font-medium">{selectedOrder.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        <span>{selectedOrder.customerEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-400" />
                        <span>{selectedOrder.customerPhone}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="text-gray-400 mt-1" />
                          <div>
                            <div className="font-medium text-sm text-gray-600">Địa chỉ gửi:</div>
                            <span>{selectedOrder.shippingFromAddress}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="text-gray-400 mt-1" />
                          <div>
                            <div className="font-medium text-sm text-gray-600">Địa chỉ nhận:</div>
                            <span>{selectedOrder.shippingToAddress}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thông tin sản phẩm */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Thông tin sản phẩm
                  </h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tên sản phẩm:</span>
                        <span className="font-medium">{selectedOrder.productName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giá sản phẩm:</span>
                        <span className="font-medium">{formatCurrency(selectedOrder.productPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Số lượng:</span>
                        <span className="font-medium">1</span>
                      </div>
                      {selectedOrder.discount && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mã giảm giá:</span>
                          <span className="font-medium text-green-600">{selectedOrder.discount.code}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600 font-semibold">Tổng phí:</span>
                        <span className="font-bold text-lg text-green-600">{formatCurrency(selectedOrder.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ghi chú */}
                {selectedOrder.notes && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Ghi chú</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{selectedOrder.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersManagement;