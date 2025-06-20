import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle 
} from "lucide-react";

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
  // Dữ liệu mẫu - trong thực tế sẽ được lấy từ API
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalRevenue: 0,
    pendingReports: 0
  });

  // Giả lập việc lấy dữ liệu từ API
  useEffect(() => {
    // Trong thực tế, đây sẽ là một API call
    setTimeout(() => {
      setStats({
        totalUsers: 1250,
        totalPosts: 3456,
        totalRevenue: 45600000,
        pendingReports: 12
      });
    }, 1000);
  }, []);

  // Dữ liệu biểu đồ mẫu
  const chartData = {
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

  return (
    <div>
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

      {/* Biểu đồ thống kê */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="mb-4 text-xl font-bold">Thống kê theo tháng</h2>
        <div className="h-80">
          <div className="flex items-center justify-center h-full text-gray-400">
            <BarChart3 size={48} />
            <p className="ml-4 text-lg">Biểu đồ thống kê sẽ được hiển thị ở đây</p>
          </div>
        </div>
      </div>

      {/* Hoạt động gần đây */}
      <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Người dùng mới đăng ký</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center p-3 border-b border-gray-100">
                <div className="w-10 h-10 mr-4 bg-gray-200 rounded-full"></div>
                <div>
                  <p className="font-medium">Người dùng {item}</p>
                  <p className="text-sm text-gray-500">Đăng ký {item} giờ trước</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Bài đăng mới nhất</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center p-3 border-b border-gray-100">
                <div className="w-10 h-10 mr-4 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <p className="font-medium">Tiêu đề bài đăng {item}</p>
                  <p className="text-sm text-gray-500">Đăng {item * 10} phút trước</p>
                </div>
                <div className="px-2 py-1 text-xs text-white bg-green-500 rounded">Đã duyệt</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Overview;