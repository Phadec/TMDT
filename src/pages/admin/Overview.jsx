import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Loader2,
  RefreshCw
} from "lucide-react";
import { useSimpleOverviewData } from "../../hooks/useSimpleOverviewData";

function StatCard({ icon, title, value, trend, trendValue, bgColor }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${bgColor}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trendValue > 0 ? 'text-green-500' : 'text-red-500'}`}>
            <TrendingUp size={16} className="mr-1" />
            <span>{trendValue > 0 ? '+' : ''}{trendValue}%</span>
          </div>
        )}
      </div>
      <h3 className="text-lg font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function Overview() {
  // Sử dụng custom hook để quản lý dữ liệu
  const {
    stats,
    newUsers,
    recentPosts,
    loading,
    error,
    refreshData
  } = useSimpleOverviewData();

  // Dữ liệu biểu đồ mặc định nếu không có dữ liệu từ API
  const defaultChartData = {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets: [
      {
        label: 'Người dùng mới',
        data: [65, 78, 90, 105, 112, 120, 135, 142, 150, 162, 170, 180],
      },
      {
        label: 'Bài đăng mới',
        data: [120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285],
      }
    ]
  };

  // Format số tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };



  // Hiển thị loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Đang tải dữ liệu...</span>
      </div>
    );
  }

  // Hiển thị error state
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">Lỗi: {error}</span>
        </div>
        <p className="mt-2 text-sm text-red-600">
          Đang hiển thị dữ liệu mẫu. Vui lòng kiểm tra kết nối API.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header với nút refresh */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
        <button
          onClick={refreshData}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={<Users size={24} className="text-white" />}
          title="Tổng người dùng"
          value={stats.totalUsers.toLocaleString()}
          trend={true}
          trendValue={8.2}
          bgColor="bg-blue-500"
        />
        
        <StatCard 
          icon={<FileText size={24} className="text-white" />}
          title="Tổng bài đăng"
          value={stats.totalPosts.toLocaleString()}
          trend={true}
          trendValue={12.5}
          bgColor="bg-green-500"
        />
        
        <StatCard 
          icon={<DollarSign size={24} className="text-white" />}
          title="Doanh thu"
          value={formatCurrency(stats.totalRevenue)}
          trend={true}
          trendValue={5.3}
          bgColor="bg-purple-500"
        />
        
        <StatCard 
          icon={<AlertTriangle size={24} className="text-white" />}
          title="Báo cáo chờ xử lý"
          value={stats.pendingReports}
          trend={false}
          bgColor="bg-orange-500"
        />
      </div>



      {/* Hoạt động gần đây */}
      <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Người dùng mới đăng ký</h2>
          <div className="space-y-4">
            {newUsers.length > 0 ? (
              newUsers.map((user, index) => (
                <div key={user.id || index} className="flex items-center p-3 border-b border-gray-100">
                  <div className="w-10 h-10 mr-4 bg-gray-200 rounded-full flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <Users size={20} className="text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{user.name || user.username || `Người dùng ${index + 1}`}</p>
                    <p className="text-sm text-gray-500">
                      {user.createdAt ? 
                        `Đăng ký ${new Date(user.createdAt).toLocaleDateString('vi-VN')}` : 
                        `Đăng ký ${index + 1} giờ trước`
                      }
                    </p>
                  </div>
                </div>
              ))
            ) : (
              // Fallback data nếu không có dữ liệu từ API
              [1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center p-3 border-b border-gray-100">
                  <div className="w-10 h-10 mr-4 bg-gray-200 rounded-full"></div>
                  <div>
                    <p className="font-medium">Người dùng {item}</p>
                    <p className="text-sm text-gray-500">Đăng ký {item} giờ trước</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Bài đăng mới nhất</h2>
          <div className="space-y-4">
            {recentPosts.length > 0 ? (
              recentPosts.map((post, index) => (
                <div key={post.id || index} className="flex items-center p-3 border-b border-gray-100">
                  <div className="w-10 h-10 mr-4 bg-gray-200 rounded flex items-center justify-center">
                    {post.image ? (
                      <img src={post.image} alt={post.title} className="w-full h-full rounded object-cover" />
                    ) : (
                      <FileText size={20} className="text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{post.title || `Tiêu đề bài đăng ${index + 1}`}</p>
                    <p className="text-sm text-gray-500">
                      {post.createdAt ? 
                        `Đăng ${new Date(post.createdAt).toLocaleDateString('vi-VN')}` : 
                        `Đăng ${(index + 1) * 10} phút trước`
                      }
                    </p>
                  </div>
                  <div className={`px-2 py-1 text-xs text-white rounded ${
                    post.status === 'APPROVED' ? 'bg-green-500' : 
                    post.status === 'PENDING' ? 'bg-yellow-500' : 
                    post.status === 'REJECTED' ? 'bg-red-500' : 'bg-green-500'
                  }`}>
                    {post.status === 'APPROVED' ? 'Đã duyệt' : 
                     post.status === 'PENDING' ? 'Chờ duyệt' : 
                     post.status === 'REJECTED' ? 'Từ chối' : 'Đã duyệt'}
                  </div>
                </div>
              ))
            ) : (
              // Fallback data nếu không có dữ liệu từ API
              [1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center p-3 border-b border-gray-100">
                  <div className="w-10 h-10 mr-4 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <p className="font-medium">Tiêu đề bài đăng {item}</p>
                    <p className="text-sm text-gray-500">Đăng {item * 10} phút trước</p>
                  </div>
                  <div className="px-2 py-1 text-xs text-white bg-green-500 rounded">Đã duyệt</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Overview;