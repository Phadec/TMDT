import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { cardVariants } from "~/components/layouts/dashboardLayout/StyleVariants";
import Model from "./Model";

// Stats Card Component
export const StatCard = ({ type, title, value, change }) => {
  return (
    <div className={cardVariants({ type })}>
      <div className={type === "secondary" ? "text-sm text-gray-500" : "text-sm opacity-80"}>
        {title}
      </div>
      <div className={`text-2xl md:text-3xl font-bold mt-2 ${type === "secondary" ? "text-gray-900" : ""}`}>
        {value}
      </div>
      <div className={`text-sm mt-2 ${type === "secondary" ? "text-emerald-500" : "opacity-80"}`}>
        {change}
      </div>
    </div>
  );
};

// Stats Row Component
export const StatsRow = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      <StatCard 
        type="primary" 
        title="Tổng doanh thu" 
        value="₫12.5M" 
        change="+15% so với tháng trước" 
      />
      <StatCard 
        type="secondary" 
        title="Đơn hàng" 
        value="254" 
        change="+8% so với tháng trước" 
      />
      <StatCard 
        type="success" 
        title="Khách hàng mới" 
        value="120" 
        change="+12% so với tháng trước" 
      />
      <StatCard 
        type="warning" 
        title="Tỉ lệ chuyển đổi" 
        value="3.2%" 
        change="+0.5% so với tháng trước" 
      />
    </div>
  );
};

// Revenue Chart Component
export const RevenueChart = () => {
  return (
    <div className={`${cardVariants({ type: "secondary" })} lg:col-span-2`}>
      <h3 className="mb-4 text-lg font-medium text-gray-900">
        Biểu đồ doanh thu
      </h3>
      <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg md:h-64">
        {/* Placeholder for chart */}
        <p className="px-4 text-center text-gray-500">
          Biểu đồ doanh thu sẽ hiển thị ở đây
        </p>
      </div>
    </div>
  );
};

// 3D Model Visualization Component
export const ModelVisualization = () => {
  return (
    <div className={cardVariants({ type: "secondary" })}>
      <h3 className="mb-4 text-lg font-medium text-gray-900">
        Mô hình 3D
      </h3>
      <div className="h-48 overflow-hidden rounded-lg md:h-64">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
          />
          <Model />
          <OrbitControls enableZoom={false} />
          <Environment preset="city" />
        </Canvas>
      </div>
    </div>
  );
};

// Recent Activity Item Component
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
        <div className="font-medium truncate">
          Đơn hàng mới #{1000 + item}
        </div>
        <div className="text-sm text-gray-500">2 giờ trước</div>
      </div>
      <div className="w-full mt-2 text-sm font-medium text-emerald-500 sm:mt-0 sm:w-auto sm:text-right">
        +₫{Math.floor(Math.random() * 1000) * 1000}
      </div>
    </div>
  );
};

// Recent Activity Component
export const RecentActivity = () => {
  return (
    <div className={cardVariants({ type: "secondary" })}>
      <h3 className="mb-4 text-lg font-medium text-gray-900">
        Hoạt động gần đây
      </h3>
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <ActivityItem key={item} item={item} />
        ))}
      </div>
    </div>
  );
};

// Overview Tab Content Component
const OverviewTab = () => {
  return (
    <div className="space-y-6">
      <StatsRow />
      
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 md:gap-6">
        <RevenueChart />
        <ModelVisualization />
      </div>
      
      <RecentActivity />
    </div>
  );
};

export default OverviewTab;