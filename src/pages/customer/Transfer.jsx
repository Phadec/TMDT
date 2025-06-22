import { cva } from 'class-variance-authority';
import { useState, useEffect } from 'react';
import { clientApi } from '~/api/api.jsx';
import { useAuth } from '~/hooks';

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
const tableCellVariants   = cva('py-3 px-6', {
  variants: {
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: {
    align: 'left',
  },
});

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
  const [pagination, setPagination] = useState({
    page: 1,
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
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const backendStatuses = STATUS_MAPPING[status];
      
      // Call API for each backend status in the group
      const promises = backendStatuses.map(backendStatus => 
        clientApi.post(`/orders/get/status?page=${page}&size=${pagination.size}`, {
          id: user.id.toString(),
          customerId: user.id.toString(),
          status: backendStatus
        })
        .catch(err => {
          console.error(`Error fetching orders for status ${backendStatus}:`, err);
          return { data: { content: [], totalElements: 0, totalPages: 0 } };
        })
      );

      const results = await Promise.all(promises);
      
      // Combine results from all statuses
      const allOrders = results.reduce((acc, result) => {
        if (result && result.data && result.data.content) {
          acc.push(...result.data.content);
        }
        return acc;
      }, []);

      // Calculate total pagination info
      const totalElements = results.reduce((sum, result) => sum + (result?.data?.totalElements || 0), 0);
      const maxTotalPages = Math.max(...results.map(result => result?.data?.totalPages || 0));

      setOrders(allOrders);
      setPagination(prev => ({
        ...prev,
        page,
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
    fetchOrders(activeTab, pagination.page);
  }, [activeTab, pagination.page, user?.id]);

  // Handle tab change
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
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

  return (
    <div>
      <h2 className="section-title">Lịch sử giao dịch</h2>
      
      {/* Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={tabButtonVariants({ active: activeTab === tab.key })}
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

      {/* Orders table */}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className={tableCellVariants({ align: 'left' })}>Mã đơn hàng</th>
                <th className={tableCellVariants({ align: 'left' })}>Ngày</th>
                <th className={tableCellVariants({ align: 'left' })}>Sản phẩm</th>
                <th className={tableCellVariants({ align: 'right' })}>Tổng tiền</th>
                <th className={tableCellVariants({ align: 'center' })}>Trạng thái</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className={tableCellVariants({ align: 'left' })}>#{order.id}</td>
                    <td className={tableCellVariants({ align: 'left' })}>
                      {formatDate(order.createdAt || order.orderDate)}
                    </td>
                    <td className={tableCellVariants({ align: 'left' })}>
                      {order.items?.map(item => item.productName).join(', ') || 'N/A'}
                    </td>
                    <td className={tableCellVariants({ align: 'right' })}>
                      {formatCurrency(order.totalAmount || 0)}
                    </td>
                    <td className={tableCellVariants({ align: 'center' })}>
                      <span className={badgeVariants({ status: getStatusGroup(order.status) })}>
                        {STATUS_LABELS[getStatusGroup(order.status)]}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    Không có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Trước
          </button>
          
          <span className="text-sm text-gray-600">
            Trang {pagination.page} / {pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      )}

      {/* Total count */}
      {!loading && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Tổng cộng: {pagination.totalElements} đơn hàng
        </div>
      )}
    </div>
  );
}

export default Transfer;
