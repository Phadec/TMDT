import { useState } from "react";

import Avatar from "./Avatar";
import Profile from "./Profile";
import Transfer from "./Transfer";
import Setting from "./Setting";
import { useAuth } from "~/hooks/useAuth";

const tabs = [
  {
    id: "profile",
    label: "Thông tin cá nhân"
  },
  {
    id: "history",
    label: "Lịch sử giao dịch"
  },
  {
    id: "settings",
    label: "Cài đặt"
  },
  {
    id: "logout",
    label: "Đăng xuất",
    custom: "text-red-500"
  }
]

function Customer() {
  const [activeTab, setActiveTab] = useState("profile");
  const [userFullName, setUserFullName] = useState("Người dùng");
  const { logout } = useAuth();

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleProfileDataChange = (profileData) => {
    if (profileData.fullname) {
      setUserFullName(profileData.fullname);
    }
  };

  // Nội dung cho từng tab
  const tabContents = {
    profile: (
      <Profile onProfileDataChange={handleProfileDataChange} />
    ),
    history: (
      <Transfer />
    ),
    settings: (
      <Setting />
    ),
    logout: null // Sẽ được xử lý riêng
  };

  return (
    <div className="h-full flex items-center justify-center lg:px-2 px-4 pt-[530px] lg:pt-0">
      <div className="flex flex-col md:flex-row w-full max-w-5xl h-auto md:h-[600px]">
        {/* Bên trái */}
        <div className="w-full h-auto p-4 mb-4 overflow-auto bg-white rounded-lg shadow-md md:w-1/3 sm:p-6 md:h-full md:mb-0">
          {/* Avatar và tên người dùng */}
          <div className="flex flex-col items-center">
            <Avatar name={userFullName} username="user" />
          </div>

          {/* Danh sách tính năng */}
          <div className="mt-8 space-y-3 sm:mt-10 sm:space-y-4">
            {
              tabs.map((tab) => (
                <button 
                  key={tab.id} 
                  className={`w-full text-left px-3 sm:px-4 py-2 rounded ${tab.custom || ''} ${activeTab === tab.id ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                  onClick={() => tab.id === "logout" ? handleLogout() : handleTabClick(tab.id)}
                >
                  {tab.label}
                </button>
              ))
            }
          </div>
        </div>

        {/* Bên phải */}
        <div className="flex flex-col w-full h-auto mb-32 md:w-2/3 md:pl-6 md:h-full lg:mb-0">
          <h1 className="mb-3 text-xl font-bold sm:text-2xl sm:mb-4">Chi tiết</h1>
          <div className="flex-1 p-4 overflow-y-auto bg-white rounded shadow sm:p-6">
            {tabContents[activeTab]}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Customer;
