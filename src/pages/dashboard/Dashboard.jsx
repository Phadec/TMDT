import { useState, useEffect } from "react";
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
import Sidebar, { MobileMenuButton } from "./Sidebar";
import MainContent from "./MainContent";

// Main Dashboard Component
function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check if the screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const tabs = [
    { id: "overview", label: "Tổng quan", icon: <BarChart2 size={20} /> },
    { id: "add-product", label: "Đăng sản phẩm", icon: <PlusCircle size={20} /> },
    { id: "manage-products", label: "Quản lý sản phẩm", icon: <Grid size={20} /> },
    { id: "customers", label: "Khách hàng", icon: <Users size={20} /> },
    { id: "messages", label: "Tin nhắn", icon: <MessageSquare size={20} /> },
    { id: "settings", label: "Cài đặt", icon: <Settings size={20} /> },
    { id: "help", label: "Trợ giúp", icon: <HelpCircle size={20} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 relative">
      <MobileMenuButton sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobile={isMobile}
        tabs={tabs}
      />
      
      <MainContent activeTab={activeTab} tabs={tabs} />
    </div>
  );
}

export default Dashboard;