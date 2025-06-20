import { 
  BarChart3, 
  Users, 
  FileText, 
  Bell, 
  Settings, 
  DollarSign, 
  Tag, 
  AlertTriangle 
} from "lucide-react";
import Overview from "./Overview";
import PostsManagement from "./PostsManagement";
import UsersManagement from "./UsersManagement";
import NotificationsManagement from "./NotificationsManagement";
import SettingsPanel from "./SettingsPanel";
import FinancialAnalytics from "./FinancialAnalytics";
import CategoriesManagement from "./CategoriesManagement";
import ReportsManagement from "./ReportsManagement";

function Dashboard({ activeTab }) {
  // Các tab chính của dashboard admin
  const tabComponents = {
    overview: <Overview />,
    posts: <PostsManagement />,
    users: <UsersManagement />,
    notifications: <NotificationsManagement />,
    settings: <SettingsPanel />,
    financial: <FinancialAnalytics />,
    categories: <CategoriesManagement />,
    reports: <ReportsManagement />
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {activeTab === "overview" && "Tổng quan hệ thống"}
          {activeTab === "posts" && "Quản lý bài đăng"}
          {activeTab === "users" && "Quản lý người dùng"}
          {activeTab === "notifications" && "Quản lý thông báo"}
          {activeTab === "settings" && "Cài đặt hệ thống"}
          {activeTab === "financial" && "Phân tích tài chính"}
          {activeTab === "categories" && "Quản lý danh mục"}
          {activeTab === "reports" && "Quản lý báo cáo vi phạm"}
        </h1>
        <p className="text-gray-500">
          {activeTab === "overview" && "Xem tổng quan về hoạt động của hệ thống"}
          {activeTab === "posts" && "Kiểm duyệt và quản lý các bài đăng rao vặt"}
          {activeTab === "users" && "Quản lý tài khoản người dùng và phân quyền"}
          {activeTab === "notifications" && "Quản lý thông báo hệ thống"}
          {activeTab === "settings" && "Thiết lập cấu hình hệ thống"}
          {activeTab === "financial" && "Phân tích doanh thu và tài chính"}
          {activeTab === "categories" && "Quản lý danh mục sản phẩm và dịch vụ"}
          {activeTab === "reports" && "Xử lý báo cáo vi phạm từ người dùng"}
        </p>
      </div>

      {/* Hiển thị nội dung tương ứng với tab đang active */}
      {tabComponents[activeTab]}
    </div>
  );
}

// Định nghĩa các tab cho sidebar
Dashboard.tabs = [
  { id: "overview", label: "Tổng quan", icon: <BarChart3 size={18} className="mr-2" /> },
  { id: "posts", label: "Quản lý bài đăng", icon: <FileText size={18} className="mr-2" /> },
  { id: "users", label: "Quản lý người dùng", icon: <Users size={18} className="mr-2" /> },
  { id: "notifications", label: "Quản lý thông báo", icon: <Bell size={18} className="mr-2" /> },
  { id: "financial", label: "Phân tích tài chính", icon: <DollarSign size={18} className="mr-2" /> },
  { id: "categories", label: "Quản lý danh mục", icon: <Tag size={18} className="mr-2" /> },
  { id: "reports", label: "Báo cáo vi phạm", icon: <AlertTriangle size={18} className="mr-2" /> },
  { id: "settings", label: "Cài đặt hệ thống", icon: <Settings size={18} className="mr-2" /> },
];

export default Dashboard;