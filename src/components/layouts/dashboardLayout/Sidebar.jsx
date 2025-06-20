import { Link } from "react-router-dom";
import { ArrowLeft, X, Menu, LogOut } from "lucide-react";
import { tabVariants } from "~/pages/dashboard/StyleVariants";
import { useAuth } from "~/hooks/useAuth";

// Mobile Menu Button Component
export const MobileMenuButton = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <button
      onClick={() => setSidebarOpen(!sidebarOpen)}
      className="fixed z-50 p-2 text-white bg-indigo-600 rounded-lg shadow-md md:hidden top-4 right-4"
    >
      {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
    </button>
  );
};

// Sidebar Header Component
export const SidebarHeader = () => {
  return (
    <>
      <div className="p-4 border-b border-gray-200">
        <Link
          to="/"
          className="flex items-center gap-2 font-medium text-indigo-600"
        >
          <ArrowLeft size={18} />
          <span>Quay về trang chủ</span>
        </Link>
      </div>

      <div className="flex items-center gap-3 p-6">
        <div className="flex items-center justify-center w-10 h-10 font-bold text-white bg-indigo-600 rounded-lg">
          CV
        </div>
        <div className="text-xl font-bold">Dashboard</div>
      </div>
    </>
  );
};

// Sidebar Tabs Component
export const SidebarTabs = ({ tabs, activeTab, setActiveTab, isMobile, setSidebarOpen }) => {
  return (
    <div className="flex-1 w-full p-3 space-y-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`w-full ${tabVariants({
            active: activeTab === tab.id,
          })}`}
          onClick={() => {
            setActiveTab(tab.id);
            if (isMobile) setSidebarOpen(false);
          }}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

// User Profile Component
export const UserProfile = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="p-4 mt-auto border-t border-gray-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div>
          <div className="font-medium">Người dùng</div>
          <div className="text-sm text-gray-500">Seller</div>
        </div>
      </div>
      
      {/* Nút đăng xuất */}
      <button
        onClick={handleLogout}
        className="flex items-center w-full gap-2 px-3 py-2 text-sm text-red-600 transition-colors duration-200 rounded-lg hover:bg-red-50"
      >
        <LogOut size={16} />
        <span>Đăng xuất</span>
      </button>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab, isMobile, tabs }) => {
  return (
    <>
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 fixed md:relative z-40 h-full md:h-auto md:w-64 bg-white border-r border-gray-200 flex flex-col`}
      >
        <SidebarHeader />
        <SidebarTabs 
          tabs={tabs} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isMobile={isMobile} 
          setSidebarOpen={setSidebarOpen} 
        />
        <UserProfile />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;