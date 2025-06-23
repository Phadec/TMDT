import { useState, useEffect } from "react";
import { Calendar, DollarSign, TrendingUp, TrendingDown, CreditCard, Download, Filter } from "lucide-react";
import { adminServices } from "~/api";

function FinancialAnalytics() {
  // State cho dữ liệu tài chính
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    dailyRevenue: 0,
    transactions: [],
    revenueByCategory: {},
    revenueByMonth: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("month"); // "day", "week", "month", "year", "custom"
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: ""
  });

  // Lấy dữ liệu từ API
  useEffect(() => {
    fetchFinancialData();
  }, [dateRange, customDateRange]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Xác định startDate và endDate dựa trên dateRange
      let startDate = null;
      let endDate = null;
      
      if (dateRange === "custom") {
        startDate = customDateRange.startDate;
        endDate = customDateRange.endDate;
      }
      
      // Gọi API để lấy dữ liệu tài chính
      try {
        const [financialResponse, transactionsResponse] = await Promise.all([
          adminServices.analytics.getFinancialData(dateRange, startDate, endDate),
          adminServices.analytics.getTransactions(0, 20, null, dateRange, startDate, endDate)
        ]);
        
        console.log('Financial Response:', financialResponse);
        console.log('Transactions Response:', transactionsResponse);
        
        // Xử lý dữ liệu từ backend
        if (financialResponse && financialResponse.data) {
          setFinancialData(financialResponse.data);
        } else {
          throw new Error('No analytics API available');
        }
      } catch (analyticsError) {
        console.log('Analytics API not available, falling back to orders data');
        // Fallback: tính toán từ orders nếu không có API analytics riêng
        await fetchDataFromOrders();
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setError('Không thể tải dữ liệu tài chính. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  // Fallback function: tính toán dữ liệu từ orders
  const fetchDataFromOrders = async () => {
    try {
      // Lấy tất cả orders để tính toán
      const ordersResponse = await adminServices.orders.getAll(0, 1000); // Lấy nhiều orders
      
      if (ordersResponse && (ordersResponse.content || ordersResponse.data)) {
        const orders = ordersResponse.content || ordersResponse.data || [];
        
        // Tính toán dữ liệu tài chính từ orders
        const calculatedData = calculateFinancialDataFromOrders(orders);
        setFinancialData(calculatedData);
      }
    } catch (error) {
      console.error('Error fetching orders for financial calculation:', error);
      // Sử dụng dữ liệu mẫu nếu không thể lấy từ API
      setFinancialData(getDefaultFinancialData());
    }
  };

  // Hàm tính toán dữ liệu tài chính từ orders
  const calculateFinancialDataFromOrders = (orders) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let totalRevenue = 0;
    let monthlyRevenue = 0;
    let dailyRevenue = 0;
    const transactions = [];
    const revenueByCategory = {};
    const revenueByMonth = {};
    
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const amount = order.fee || 0;
      
      // Tổng doanh thu
      totalRevenue += amount;
      
      // Doanh thu tháng này
      if (orderDate >= thisMonth) {
        monthlyRevenue += amount;
      }
      
      // Doanh thu hôm nay
      if (orderDate >= today) {
        dailyRevenue += amount;
      }
      
      // Doanh thu theo tháng
      const monthKey = String(orderDate.getMonth() + 1).padStart(2, '0');
      revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + amount;
      
      // Tạo transaction từ order
      transactions.push({
        id: order.id,
        userId: order.customer?.id || order.customerId,
        userName: order.fullName || order.customer?.fullName || "Khách hàng ẩn danh",
        amount: amount,
        type: "order", // Có thể phân loại theo product category
        status: mapOrderStatusToTransactionStatus(order.status),
        paymentMethod: order.payment?.method || order.payment?.transaction || "COD",
        createdAt: order.createdAt
      });
    });
    
    // Phân loại doanh thu theo category (giả lập)
    revenueByCategory["orders"] = totalRevenue;
    
    return {
      totalRevenue,
      monthlyRevenue,
      dailyRevenue,
      transactions: transactions.slice(0, 20), // Chỉ lấy 20 giao dịch gần nhất
      revenueByCategory,
      revenueByMonth
    };
  };

  // Map trạng thái order sang trạng thái transaction
  const mapOrderStatusToTransactionStatus = (orderStatus) => {
    switch (orderStatus?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'completed';
      case 'pending':
      case 'ready_to_pick':
      case 'picking':
      case 'delivering':
        return 'pending';
      case 'cancelled':
      case 'failed':
        return 'failed';
      default:
        return 'pending';
    }
  };

  // Dữ liệu mặc định nếu không thể lấy từ API
  const getDefaultFinancialData = () => ({
    totalRevenue: 0,
    monthlyRevenue: 0,
    dailyRevenue: 0,
    transactions: [],
    revenueByCategory: {},
    revenueByMonth: {}
  });

  // Format số tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Hiển thị loại giao dịch
  const renderTransactionType = (type) => {
    switch (type) {
      case "order":
        return "Đơn hàng";
      case "featured_post":
        return "Tin nổi bật";
      case "highlighted_post":
        return "Tin được đánh dấu";
      case "urgent_post":
        return "Tin gấp";
      case "subscription":
        return "Gói đăng ký";
      default:
        return type || "Không xác định";
    }
  };

  // Hiển thị trạng thái giao dịch
  const renderTransactionStatus = (status) => {
    switch (status) {
      case "completed":
        return <span className="px-2 py-1 text-xs text-white bg-green-500 rounded-full">Hoàn thành</span>;
      case "pending":
        return <span className="px-2 py-1 text-xs text-white bg-yellow-500 rounded-full">Đang xử lý</span>;
      case "failed":
        return <span className="px-2 py-1 text-xs text-white bg-red-500 rounded-full">Thất bại</span>;
      default:
        return null;
    }
  };

  // Xử lý áp dụng custom date range
  const handleApplyCustomDateRange = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      fetchFinancialData();
    } else {
      alert("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc");
    }
  };

  // Xử lý xuất báo cáo
  const handleExportReport = () => {
    alert("Tính năng xuất báo cáo sẽ được triển khai sau");
  };

  // Hiển thị loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Đang tải dữ liệu tài chính...</p>
        </div>
      </div>
    );
  }

  // Hiển thị error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="mb-4 text-red-600">{error}</p>
          <button 
            onClick={fetchFinancialData}
            className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 text-white bg-indigo-600 rounded-full">
              <DollarSign size={24} />
            </div>
            <div className="flex items-center text-sm text-green-500">
              <TrendingUp size={16} className="mr-1" />
              <span>+8.2%</span>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-500">Tổng doanh thu</h3>
          <p className="text-2xl font-bold">{formatCurrency(financialData.totalRevenue)}</p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 text-white bg-green-500 rounded-full">
              <DollarSign size={24} />
            </div>
            <div className="flex items-center text-sm text-green-500">
              <TrendingUp size={16} className="mr-1" />
              <span>+5.3%</span>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-500">Doanh thu tháng này</h3>
          <p className="text-2xl font-bold">{formatCurrency(financialData.monthlyRevenue)}</p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 text-white bg-blue-500 rounded-full">
              <DollarSign size={24} />
            </div>
            <div className="flex items-center text-sm text-red-500">
              <TrendingDown size={16} className="mr-1" />
              <span>-2.1%</span>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-500">Doanh thu hôm nay</h3>
          <p className="text-2xl font-bold">{formatCurrency(financialData.dailyRevenue)}</p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 text-white bg-purple-500 rounded-full">
              <CreditCard size={24} />
            </div>
            <div className="flex items-center text-sm text-green-500">
              <TrendingUp size={16} className="mr-1" />
              <span>+12.5%</span>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-500">Số giao dịch</h3>
          <p className="text-2xl font-bold">{financialData.transactions?.length || 0}</p>
        </div>
      </div>

      {/* Bộ lọc thời gian */}
      <div className="flex flex-col gap-4 p-6 mb-6 bg-white rounded-lg shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          <Calendar size={20} className="mr-2 text-gray-500" />
          <h3 className="text-lg font-medium">Phân tích theo thời gian</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 text-sm rounded-lg ${dateRange === "day" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setDateRange("day")}
          >
            Hôm nay
          </button>
          <button
            className={`px-4 py-2 text-sm rounded-lg ${dateRange === "week" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setDateRange("week")}
          >
            Tuần này
          </button>
          <button
            className={`px-4 py-2 text-sm rounded-lg ${dateRange === "month" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setDateRange("month")}
          >
            Tháng này
          </button>
          <button
            className={`px-4 py-2 text-sm rounded-lg ${dateRange === "year" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setDateRange("year")}
          >
            Năm nay
          </button>
          <button
            className={`px-4 py-2 text-sm rounded-lg ${dateRange === "custom" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setDateRange("custom")}
          >
            Tùy chỉnh
          </button>
        </div>
        
        {dateRange === "custom" && (
          <div className="flex flex-wrap gap-2">
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={customDateRange.startDate}
              onChange={(e) => setCustomDateRange({...customDateRange, startDate: e.target.value})}
            />
            <span className="self-center">đến</span>
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={customDateRange.endDate}
              onChange={(e) => setCustomDateRange({...customDateRange, endDate: e.target.value})}
            />
            <button 
              onClick={handleApplyCustomDateRange}
              className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Áp dụng
            </button>
          </div>
        )}
        
        <button
          onClick={handleExportReport}
          className="flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
        >
          <Download size={18} className="mr-1" />
          Xuất báo cáo
        </button>
      </div>

      {/* Biểu đồ doanh thu */}
      <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h3 className="mb-4 text-lg font-medium">Doanh thu theo tháng</h3>
          <div className="h-80">
            <div className="flex items-center justify-center h-full text-gray-400">
              <TrendingUp size={48} />
              <p className="ml-4 text-lg">Biểu đồ doanh thu theo tháng sẽ được hiển thị ở đây</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h3 className="mb-4 text-lg font-medium">Doanh thu theo loại dịch vụ</h3>
          <div className="h-80">
            <div className="flex items-center justify-center h-full text-gray-400">
              <DollarSign size={48} />
              <p className="ml-4 text-lg">Biểu đồ doanh thu theo loại dịch vụ sẽ được hiển thị ở đây</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng giao dịch gần đây */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Giao dịch gần đây</h3>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="all">Tất cả giao dịch</option>
              <option value="completed">Hoàn thành</option>
              <option value="pending">Đang xử lý</option>
              <option value="failed">Thất bại</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Người dùng</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Số tiền</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Loại dịch vụ</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Phương thức</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Ngày giao dịch</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {!financialData.transactions || financialData.transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Không có giao dịch nào trong khoảng thời gian này
                  </td>
                </tr>
              ) : (
                financialData.transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 text-sm text-gray-500">#{transaction.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 mr-3 bg-gray-200 rounded-full"></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{transaction.userName}</div>
                          <div className="text-sm text-gray-500">ID: {transaction.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{renderTransactionType(transaction.type)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{transaction.paymentMethod}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(transaction.createdAt)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {renderTransactionStatus(transaction.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Hiển thị 1-{Math.min(10, financialData.transactions.length)} trong số {financialData.transactions.length} giao dịch
          </div>
          <div className="flex gap-1">
            <button className="px-3 py-1 text-gray-700 bg-gray-200 rounded-lg">Trước</button>
            <button className="px-3 py-1 text-white bg-indigo-600 rounded-lg">1</button>
            <button className="px-3 py-1 text-gray-700 bg-gray-200 rounded-lg">2</button>
            <button className="px-3 py-1 text-gray-700 bg-gray-200 rounded-lg">3</button>
            <button className="px-3 py-1 text-gray-700 bg-gray-200 rounded-lg">Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinancialAnalytics;