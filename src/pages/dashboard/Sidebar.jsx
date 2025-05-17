import { Link } from "react-router-dom";
import { ArrowLeft, X, Menu } from "lucide-react";
import { tabVariants } from "./StyleVariants";

// Mobile Menu Button Component
export const MobileMenuButton = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <button
      onClick={() => setSidebarOpen(!sidebarOpen)}
      className="md:hidden fixed top-4 right-4 z-50 bg-indigo-600 text-white p-2 rounded-lg shadow-md"
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
          className="flex items-center gap-2 text-indigo-600 font-medium"
        >
          <ArrowLeft size={18} />
          <span>Quay về trang chủ</span>
        </Link>
      </div>

      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
          CV
        </div>
        <div className="font-bold text-xl">Dashboard</div>
      </div>
    </>
  );
};

// Sidebar Tabs Component
export const SidebarTabs = ({ tabs, activeTab, setActiveTab, isMobile, setSidebarOpen }) => {
  return (
    <div className="flex-1 p-3 space-y-1 w-full">
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
  return (
    <div className="p-4 border-t border-gray-200 mt-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div>
          <div className="font-medium">Người dùng</div>
          <div className="text-sm text-gray-500">Seller</div>
        </div>
      </div>
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
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;