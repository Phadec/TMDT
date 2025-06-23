import { cva } from 'class-variance-authority';
import { useState, useEffect } from 'react';
import { clientApi } from '~/api/api.jsx';
import { useAuth } from '~/hooks';
import { StarIcon, FlagIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const badgeVariants = cva(
    'py-1 px-3 rounded-full text-xs',
    {
      variants: {
        status: {
          PENDING: 'bg-yellow-200 text-yellow-600',
          PREPARING: 'bg-blue-200 text-blue-600',
          PACKED: 'bg-purple-200 text-purple-600',
          SHIPPING: 'bg-indigo-200 text-indigo-600',
          DELIVERED: 'bg-green-200 text-green-600',
          CANCELLED: 'bg-red-200 text-red-600',
          RETURNED: 'bg-gray-200 text-gray-600',
        },
      },
      defaultVariants: {
        status: 'PENDING',
      },
    }
);

const tabButtonVariants = cva(
  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
  {
    variants: {
      active: {
        true: 'bg-blue-500 text-white',
        false: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);
const tableCellVariants = cva('py-3 px-4', {
  variants: {
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
    width: {
      narrow: 'w-20',
      small: 'w-32',
      medium: 'w-40',
      large: 'w-48',
      auto: 'w-auto',
    },
  },
  defaultVariants: {
    align: 'left',
    width: 'auto',
  },
});

const actionButtonVariants = cva(
  'p-2 rounded-full transition-colors duration-200 hover:scale-110 transform',
  {
    variants: {
      type: {
        review: 'text-yellow-500 hover:bg-yellow-50 hover:text-yellow-600',
        report: 'text-red-500 hover:bg-red-50 hover:text-red-600',
      },
    },
  }
);

// Mapping trạng thái từ BE sang Frontend
const STATUS_MAPPING = {
  PENDING: ['READY_TO_PICK'],
  PREPARING: ['PICKING', 'PICKED', 'STORING'],
  PACKED: ['TRANSPORTING'],
  SHIPPING: ['DELIVERING'],
  DELIVERED: ['DELIVERED'],
  CANCELLED: ['CANCEL', 'DELIVERY_FAIL'],
  RETURNED: ['WAITING_TO_RETURN', 'RETURN', 'RETURN_TRANSPORTING', 'RETURNING', 'RETURNED', 'RETURN_FAIL']
};

// Mapping ngược từ BE status sang Frontend status
const getStatusGroup = (backendStatus) => {
  for (const [frontendStatus, backendStatuses] of Object.entries(STATUS_MAPPING)) {
    if (backendStatuses.includes(backendStatus)) {
      return frontendStatus;
    }
  }
  return 'PENDING'; // Default
};

// Mapping tên hiển thị
const STATUS_LABELS = {
  PENDING: 'Chờ xử lý',
  PREPARING: 'Đang chuẩn bị',
  PACKED: 'Đã đóng gói',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
  RETURNED: 'Đã trả'
};

function Transfer() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('PENDING');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    size: 15,
    totalPages: 0,
    totalElements: 0
  });

  const tabs = [
    { key: 'PENDING', label: 'Chờ xử lý' },
    { key: 'PREPARING', label: 'Đang chuẩn bị' },
    { key: 'PACKED', label: 'Đã đóng gói' },
    { key: 'SHIPPING', label: 'Đang giao' },
    { key: 'DELIVERED', label: 'Đã giao' },
    { key: 'CANCELLED', label: 'Đã hủy' },
    { key: 'RETURNED', label: 'Đã trả' }
  ];

  // Fetch orders by status
  const fetchOrders = async (status, page = 1) => {
    if (!user?.id) {
      console.log('No user ID found:', user);
      return;
    }
    
    console.log('Fetching orders for user:', user.id, 'status:', status, 'page:', page);
    
    setLoading(true);
    try {
      const backendStatuses = STATUS_MAPPING[status];
      console.log('Backend statuses to fetch:', backendStatuses);
      
      // Call API for each backend status in the group
      const promises = backendStatuses.map(backendStatus => 
        clientApi.post(`/orders/get/status?page=${page}&size=${pagination.size}`, {
          customerId: user.id.toString(),
          status: backendStatus
        })
        .catch(err => {
          console.error(`Error fetching orders for status ${backendStatus}:`, err);
          return { content: [], totalElements: 0, totalPages: 0 };
        })
      );

      const results = await Promise.all(promises);
      
      console.log('API Results for status', status, ':', results);
      
      // Combine results from all statuses
      const allOrders = results.reduce((acc, result) => {
        if (result && result.content) {
          console.log('Adding orders from result:', result.content);
          acc.push(...result.content);
        }
        return acc;
      }, []);
      
      console.log('Combined orders:', allOrders);

      // Calculate total pagination info
      const totalElements = results.reduce((sum, result) => sum + (result?.totalElements || 0), 0);
      const maxTotalPages = Math.max(...results.map(result => result?.totalPages || 0));

      setOrders(allOrders);
      setCurrentPage(page);
      setPagination(prev => ({
        ...prev,
        totalElements,
        totalPages: maxTotalPages
      }));

    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Load orders when tab or page changes
  useEffect(() => {
    if (user?.id) {
      fetchOrders(activeTab, currentPage);
    }
  }, [activeTab, currentPage, user?.id]);

  // Handle tab change
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Handle review action
  const handleReview = (orderId) => {
    console.log('Review order:', orderId);
    // TODO: Implement review functionality
    // This could open a modal or navigate to review page
  };

  // Handle report action
  const handleReport = (orderId) => {
    console.log('Report order:', orderId);
    // TODO: Implement report functionality
    // This could open a modal or navigate to report page
  };

  // Truncate text for better UI
  const truncateText = (text, maxLength = 30) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div>
      <h2 className="section-title">Lịch sử giao dịch</h2>
      
      {/* Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`${tabButtonVariants({ active: activeTab === tab.key })} text-xs md:text-sm px-3 md:px-4 py-2 whitespace-nowrap`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Orders table - Desktop */}
      {!loading && (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto shadow-sm rounded-lg">
            <table className="min-w-full bg-white table-fixed">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="w-24 py-3 px-4 text-left">Mã ĐH</th>
                  <th className="w-28 py-3 px-4 text-left">Ngày</th>
                  <th className="flex-1 py-3 px-4 text-left">Sản phẩm</th>
                  <th className="w-32 py-3 px-4 text-right">Tổng tiền</th>
                  <th className="w-32 py-3 px-4 text-center">Trạng thái</th>
                  {activeTab === 'DELIVERED' && (
                    <th className="w-24 py-3 px-4 text-center">Thao tác</th>
                  )}
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="w-24 py-3 px-4">
                        <span className="font-medium text-blue-600">#{order.id}</span>
                      </td>
                      <td className="w-28 py-3 px-4">
                        <span className="text-gray-700 text-xs">
                          {formatDate(order.createdAt || order.payment?.createdAt)}
                        </span>
                      </td>
                      <td className="flex-1 py-3 px-4">
                        <div className="max-w-full">
                          <span 
                            className="block truncate text-gray-800 font-medium" 
                            title={order.product?.name || 'N/A'}
                          >
                            {truncateText(order.product?.name, 50)}
                          </span>
                        </div>
                      </td>
                      <td className="w-32 py-3 px-4 text-right">
                        <span className="font-semibold text-green-600 text-xs">
                          {formatCurrency(
                            order.payment?.amount ? parseInt(order.payment.amount) / 100 : 
                            order.fee ? order.fee : 
                            order.product?.price ? parseInt(order.product.price) : 0
                          )}
                        </span>
                      </td>
                      <td className="w-32 py-3 px-4 text-center">
                        <span className={badgeVariants({ status: getStatusGroup(order.status) })}>
                          {STATUS_LABELS[getStatusGroup(order.status)]}
                        </span>
                      </td>
                      {activeTab === 'DELIVERED' && (
                        <td className="w-24 py-3 px-4">
                          <div className="flex justify-center space-x-1">
                            <button
                              onClick={() => handleReview(order.id)}
                              className={actionButtonVariants({ type: 'review' })}
                              title="Đánh giá sản phẩm"
                            >
                              <StarIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReport(order.id)}
                              className={actionButtonVariants({ type: 'report' })}
                              title="Báo cáo vấn đề"
                            >
                              <FlagIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeTab === 'DELIVERED' ? "6" : "5"} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center">
                        <div className="text-gray-400 mb-2">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
                          </svg>
                        </div>
                        <span>Không có đơn hàng nào</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-medium text-blue-600">#{order.id}</span>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(order.createdAt || order.payment?.createdAt)}
                      </p>
                    </div>
                    <span className={badgeVariants({ status: getStatusGroup(order.status) })}>
                      {STATUS_LABELS[getStatusGroup(order.status)]}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-gray-800 font-medium text-sm" title={order.product?.name || 'N/A'}>
                      {truncateText(order.product?.name, 60)}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-600">
                      {formatCurrency(
                        order.payment?.amount ? parseInt(order.payment.amount) / 100 : 
                        order.fee ? order.fee : 
                        order.product?.price ? parseInt(order.product.price) : 0
                      )}
                    </span>
                    
                    {activeTab === 'DELIVERED' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleReview(order.id)}
                          className={actionButtonVariants({ type: 'review' })}
                          title="Đánh giá sản phẩm"
                        >
                          <StarIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleReport(order.id)}
                          className={actionButtonVariants({ type: 'report' })}
                          title="Báo cáo vấn đề"
                        >
                          <FlagIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-sm">
                <div className="flex flex-col items-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
                    </svg>
                  </div>
                  <span>Không có đơn hàng nào</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center mt-6 space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors w-full sm:w-auto"
          >
            ← Trang trước
          </button>
          
          <span className="text-sm text-gray-600 px-4 py-2 bg-gray-50 rounded-lg">
            Trang {currentPage} / {pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pagination.totalPages}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors w-full sm:w-auto"
          >
            Trang sau →
          </button>
        </div>
      )}

      {/* Total count */}
      {!loading && (
        <div className="mt-4 text-sm text-gray-600 text-center bg-gray-50 py-2 rounded-lg">
          <span className="font-medium">Tổng cộng: {pagination.totalElements} đơn hàng</span>
        </div>
      )}
    </div>
  );
}

export default Transfer;
