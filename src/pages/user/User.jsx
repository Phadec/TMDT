import { useState } from "react";

import Avatar from "./Avatar";
import Profile from "./Profile";
import Transfer from "./Transfer";
import Setting from "./Setting";

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

// Nội dung cho từng tab
const tabContents = {
  profile: (
    <Profile />
  ),
  history: (
    <Transfer />
  ),
  settings: (
    <Setting />
  ),
  logout: (
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-4">Đăng xuất</h2>
      <p className="mb-6">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?</p>
      <div className="flex justify-center space-x-4">
        <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Hủy
        </button>
        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Đăng xuất
        </button>
      </div>
    </div>
  )
};

function User() {
  const [activeTab, setActiveTab] = useState("profile");

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const handleLogout = () => {
    // Xử lý đăng xuất ở đây
    console.log("Đăng xuất");
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex w-10/12 h-[600px]"> {/* Chiều cao cố định */}
        {/* Bên trái */}
        <div className="w-1/3 bg-white p-6 shadow-md rounded-lg h-full overflow-auto">
          {/* Avatar và tên người dùng */}
          <div className="flex flex-col items-center">
            <Avatar name="Nguyễn Văn A" username="nguyenvana" />
          </div>

          {/* Danh sách tính năng */}
          <div className="mt-10 space-y-4">
            {
              tabs.map((tab) => (
                <button 
                  key={tab.id} 
                  className={`w-full text-left px-4 py-2 rounded ${tab.custom || ''} ${activeTab === tab.id ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                  onClick={() => tab.id === "logout" ? handleLogout() : handleTabClick(tab.id)}
                >
                  {tab.label}
                </button>
              ))
            }
          </div>
        </div>

        {/* Bên phải */}
        <div className="w-2/3 pl-6 h-full flex flex-col">
          <h1 className="text-2xl font-bold mb-4">Chi tiết</h1>
          <div className="bg-white rounded shadow p-6 flex-1 overflow-y-auto"> {/* Thêm thanh cuộn dọc */}
            {tabContents[activeTab]}
          </div>
        </div>
      </div>
    </div>
  );
}

export default User;
