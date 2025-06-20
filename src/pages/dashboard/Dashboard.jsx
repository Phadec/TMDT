import {
  BarChart2,
  PlusCircle,
  Grid,
  Users,
  MessageSquare,
  Settings,
  HelpCircle,
} from "lucide-react";

// Import components
import MainContent from "./MainContent";

// Main Dashboard Component
const dashboardTabs = [
  { id: "overview", label: "Tổng quan", icon: <BarChart2 size={20} /> },
  { id: "add-product", label: "Đăng sản phẩm", icon: <PlusCircle size={20} /> },
  { id: "manage-products", label: "Quản lý sản phẩm", icon: <Grid size={20} /> },
  { id: "customers", label: "Khách hàng", icon: <Users size={20} /> },
  { id: "messages", label: "Tin nhắn", icon: <MessageSquare size={20} /> },
  { id: "settings", label: "Cài đặt", icon: <Settings size={20} /> },
  { id: "help", label: "Trợ giúp", icon: <HelpCircle size={20} /> },
];

function Dashboard({ activeTab, tabs }) {
  return <MainContent activeTab={activeTab} tabs={tabs || dashboardTabs} />;
}

Dashboard.tabs = dashboardTabs;

export default Dashboard;