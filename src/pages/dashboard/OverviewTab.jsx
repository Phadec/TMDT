import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { cardVariants } from "./StyleVariants";
import Model from "./Model";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAuth } from "~/hooks";
import apiServices from "~/api/services";

// Stats Card Component
export const StatCard = ({ type, title, value, change }) => {
  return (
    <div className={cardVariants({ type })}>
      <div
        className={
          type === "secondary" ? "text-sm text-gray-500" : "text-sm opacity-80"
        }
      >
        {title}
      </div>
      <div
        className={`text-2xl md:text-3xl font-bold mt-2 ${
          type === "secondary" ? "text-gray-900" : ""
        }`}
      >
        {value}
      </div>
      <div
        className={`text-sm mt-2 ${
          type === "secondary" ? "text-emerald-500" : "opacity-80"
        }`}
      >
        {change}
      </div>
    </div>
  );
};

// Stats Row Component
export const StatsRow = ({ overviewData = {} }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      <StatCard
        type="primary"
        title="Tổng doanh thu"
        value={overviewData.totalRevenue || "₫0M"}
        change={overviewData.revenueChange || "+0% so với tháng trước"}
      />
      <StatCard
        type="secondary"
        title="Đơn hàng"
        value={overviewData.totalOrders || "0"}
        change={overviewData.ordersChange || "+0% so với tháng trước"}
      />
      <StatCard
        type="success"
        title="Khách hàng mới"
        value={overviewData.newCustomers || "0"}
        change={overviewData.customersChange || "+0% so với tháng trước"}
      />
      <StatCard
        type="warning"
        title="Tỉ lệ chuyển đổi"
        value={overviewData.conversionRate || "0%"}
        change={overviewData.conversionChange || "+0% so với tháng trước"}
      />
    </div>
  );
};

// Revenue Chart Component
export const RevenueChart = ({ revenueData = null }) => {
  return (
    <div className={`${cardVariants({ type: "secondary" })} lg:col-span-2`}>
      <h3 className="mb-4 text-lg font-medium text-gray-900">
        Biểu đồ doanh thu
      </h3>
      <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg md:h-64">
        {revenueData ? (
          <div className="w-full h-full p-4">
            {/* Placeholder for actual chart implementation */}
            <div className="flex flex-col items-center justify-center h-full">
              <div className="mb-2 text-3xl font-bold text-gray-700">
                {revenueData.totalRevenue || "₫0"}
              </div>
              <div className="text-sm text-center text-gray-500">
                Doanh thu tháng này
                <br />
                <span className="font-medium text-emerald-500">
                  {revenueData.growth || "+0%"} so với tháng trước
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="px-4 text-center text-gray-500">
            Biểu đồ doanh thu sẽ hiển thị ở đây
          </p>
        )}
      </div>
    </div>
  );
};

// 3D Model Visualization Component
export const ModelVisualization = () => {
  return (
    <div className={cardVariants({ type: "secondary" })}>
      <h3 className="mb-4 text-lg font-medium text-gray-900">Mô hình 3D</h3>
      <div className="h-48 overflow-hidden rounded-lg md:h-64">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <Model />
          <OrbitControls enableZoom={false} />
          <Environment preset="city" />
        </Canvas>
      </div>
    </div>
  );
};

// Real Activity Item Component
export const RealActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case "order":
        return "🛒";
      case "product":
        return "📦";
      case "customer":
        return "👤";
      default:
        return "📋";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInHours = Math.floor((now - activityTime) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "Vừa xong";
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ngày trước`;
    }
  };

  return (
    <div className="flex flex-wrap items-start gap-4 pb-4 border-b border-gray-100 sm:flex-nowrap">
      <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-indigo-600 bg-indigo-100 rounded-full">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-grow min-w-0">
        <div className="font-medium truncate">{activity.title}</div>
        <div className="text-sm text-gray-500">
          {formatTime(activity.timestamp)}
        </div>
      </div>
      {activity.amount && (
        <div className="w-full mt-2 text-sm font-medium text-emerald-500 sm:mt-0 sm:w-auto sm:text-right">
          +{formatCurrency(activity.amount)}
        </div>
      )}
    </div>
  );
};

// Fallback Activity Item Component (for demo data)
export const ActivityItem = ({ item }) => {
  return (
    <div
      key={item}
      className="flex flex-wrap items-start gap-4 pb-4 border-b border-gray-100 sm:flex-nowrap"
    >
      <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-indigo-600 bg-indigo-100 rounded-full">
        {item}
      </div>
      <div className="flex-grow min-w-0">
        <div className="font-medium truncate">Đơn hàng mới #{1000 + item}</div>
        <div className="text-sm text-gray-500">2 giờ trước</div>
      </div>
      <div className="w-full mt-2 text-sm font-medium text-emerald-500 sm:mt-0 sm:w-auto sm:text-right">
        +₫{Math.floor(Math.random() * 1000) * 1000}
      </div>
    </div>
  );
};

// Recent Activity Component
export const RecentActivity = ({ activities = [] }) => {
  return (
    <div className={cardVariants({ type: "secondary" })}>
      <h3 className="mb-4 text-lg font-medium text-gray-900">
        Hoạt động gần đây
      </h3>
      <div className="space-y-4">
        {activities.length > 0
          ? activities.map((activity, index) => (
              <RealActivityItem key={index} activity={activity} />
            ))
          : [1, 2, 3].map((item) => <ActivityItem key={item} item={item} />)}
      </div>
    </div>
  );
};

// Overview Tab Content Component
const OverviewTab = () => {
  const [overviewData, setOverviewData] = useState({});
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy thông tin seller từ Redux store
  const { user } = useAuth();
  const sellerId = user?.id;

  // Helper function để format tiền tệ
  const formatCurrency = (amount) => {
    if (!amount) return "₫0";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Helper function để format percentage
  const formatPercentage = (value) => {
    if (value === null || value === undefined) return "+0%";
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value}%`;
  };

  // Fetch dữ liệu dashboard overview
  const fetchDashboardData = async () => {
    if (!sellerId) {
      setError("Không tìm thấy thông tin seller");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Gọi API lấy thống kê tổng quan
      const overviewResponse = await apiServices.seller.getDashboardOverview(
        sellerId
      );

      // Transform dữ liệu để match với component
      const overviewTransformed = {
        totalRevenue: formatCurrency(overviewResponse.data?.totalRevenue || 0),
        revenueChange:
          formatPercentage(overviewResponse.data?.revenueChange) +
          " so với tháng trước",
        totalOrders: overviewResponse.data?.totalOrders?.toString() || "0",
        ordersChange:
          formatPercentage(overviewResponse.data?.ordersChange) +
          " so với tháng trước",
        newCustomers: overviewResponse.data?.newCustomers?.toString() || "0",
        customersChange:
          formatPercentage(overviewResponse.data?.customersChange) +
          " so với tháng trước",
        conversionRate: (overviewResponse.data?.conversionRate || 0) + "%",
        conversionChange:
          formatPercentage(overviewResponse.data?.conversionChange) +
          " so với tháng trước",
      };

      setOverviewData(overviewTransformed);

      // Gọi API lấy hoạt động gần đây
      const activitiesResponse = await apiServices.seller.getActivities(
        sellerId,
        5
      );
      setActivities(activitiesResponse.data || []);
    } catch (error) {
      setError(
        apiServices.utils.handleApiError(error, "tải dữ liệu dashboard")
      );
    } finally {
      setLoading(false);
    }
  };

  // UseEffect để fetch dữ liệu khi component mount
  useEffect(() => {
    fetchDashboardData();
  }, [sellerId]);

  // Render loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="mb-2 text-xl text-red-500">⚠️</div>
            <p className="font-medium text-red-600">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center px-4 py-2 mt-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Chuẩn bị dữ liệu cho RevenueChart
  const revenueChartData = {
    totalRevenue: overviewData.totalRevenue,
    growth: overviewData.revenueChange,
  };

  return (
    <div className="space-y-6">
      <StatsRow overviewData={overviewData} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 md:gap-6">
        <RevenueChart revenueData={revenueChartData} />
        <ModelVisualization />
      </div>

      <RecentActivity activities={activities} />
    </div>
  );
};

export default OverviewTab;
