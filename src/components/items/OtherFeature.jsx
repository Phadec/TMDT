import { useState } from "react";

// Component con cho tab Thông báo
function NotificationsTab({ notifications }) {
  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-3 rounded-md ${
            notification.isNew ? "bg-amber-50" : "bg-white"
          } hover:bg-amber-100 transition-colors duration-200`}
        >
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-gray-800">
              {notification.title}
              {notification.isNew && (
                <span className="ml-2 inline-block w-2 h-2 bg-amber-500 rounded-full"></span>
              )}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
        </div>
      ))}
    </div>
  );
}

// Component con cho tab Tin nhắn
function MessagesTab({ messages }) {
  return (
    <div className="space-y-2">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`p-3 rounded-md ${
            message.isNew ? "bg-amber-50" : "bg-white"
          } hover:bg-amber-100 transition-colors duration-200`}
        >
          <div className="flex justify-between">
            <p className="text-sm font-medium text-gray-800">
              {message.sender}
              {message.isNew && (
                <span className="ml-2 inline-block w-2 h-2 bg-amber-500 rounded-full"></span>
              )}
            </p>
            <p className="text-xs text-gray-500">{message.time}</p>
          </div>
          <p className="text-sm text-gray-600 mt-1">{message.message}</p>
        </div>
      ))}
    </div>
  );
}

// Component con cho tab Yêu thích
function FavoritesTab({ favorites }) {
  return (
    <div className="space-y-2">
      {favorites.map((item) => (
        <div
          key={item.id}
          className="p-3 bg-white rounded-md hover:bg-amber-50 transition-colors duration-200"
        >
          <p className="text-sm font-medium text-gray-800 mb-1">
            {item.name}
          </p>
          <div className="flex items-center">
            <span className="text-sm font-medium text-amber-600">
              {item.price}
            </span>
            <span className="text-xs text-gray-500 line-through ml-2">
              {item.discount}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Component con cho tab Trợ giúp
function HelpTab({ helpTopics }) {
  return (
    <div className="space-y-2">
      {helpTopics.map((topic) => (
        <div
          key={topic.id}
          className="flex items-center p-3 bg-white rounded-md hover:bg-amber-50 transition-colors duration-200 cursor-pointer"
        >
          <span className="text-xl mr-3">{topic.icon}</span>
          <span className="text-sm font-medium text-gray-800">
            {topic.title}
          </span>
        </div>
      ))}
    </div>
  );
}

// Component con cho thanh điều hướng tab
function TabNavigation({ activeTab, setActiveTab }) {
  return (
    <div className="flex border-b border-gray-200 mb-3">
      <TabButton 
        active={activeTab === "notifications"} 
        onClick={() => setActiveTab("notifications")}
        label="Thông báo"
      />
      <TabButton 
        active={activeTab === "messages"} 
        onClick={() => setActiveTab("messages")}
        label="Tin nhắn"
      />
      <TabButton 
        active={activeTab === "favorites"} 
        onClick={() => setActiveTab("favorites")}
        label="Yêu thích"
      />
      <TabButton 
        active={activeTab === "help"} 
        onClick={() => setActiveTab("help")}
        label="Trợ giúp"
      />
    </div>
  );
}

// Component con cho nút tab
function TabButton({ active, onClick, label }) {
  return (
    <button
      className={`flex-1 py-2 text-sm font-medium ${
        active
          ? "text-amber-600 border-b-2 border-amber-600"
          : "text-gray-500 hover:text-amber-600"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

// Component chính
function OtherFeature() {
  const [activeTab, setActiveTab] = useState("notifications");

  // Dữ liệu mẫu cho các tính năng
  const notifications = [
    { id: 1, title: "Đơn hàng #12345 đã được giao", time: "10 phút trước", isNew: true },
    { id: 2, title: "Flash Sale sắp diễn ra", time: "30 phút trước", isNew: true },
    { id: 3, title: "Ưu đãi dành riêng cho bạn", time: "2 giờ trước", isNew: false },
    { id: 4, title: "Đánh giá sản phẩm", time: "1 ngày trước", isNew: false },
  ];

  const messages = [
    { id: 1, sender: "Shop Tech Galaxy", message: "Cảm ơn bạn đã mua hàng!", time: "5 phút trước", isNew: true },
    { id: 2, sender: "Hỗ trợ khách hàng", message: "Chúng tôi có thể giúp gì cho bạn?", time: "1 giờ trước", isNew: false },
    { id: 3, sender: "Shop Fashion Hub", message: "Sản phẩm mới đã về!", time: "2 giờ trước", isNew: false },
  ];

  const favorites = [
    { id: 1, name: "Điện thoại Samsung Galaxy S23", price: "18.990.000đ", discount: "22.990.000đ" },
    { id: 2, name: "Laptop Dell XPS 13", price: "32.490.000đ", discount: "35.990.000đ" },
    { id: 3, name: "Tai nghe Apple AirPods Pro", price: "4.990.000đ", discount: "6.790.000đ" },
    { id: 4, name: "Đồng hồ thông minh Apple Watch", price: "9.590.000đ", discount: "11.990.000đ" },
  ];

  const helpTopics = [
    { id: 1, title: "Hướng dẫn mua hàng", icon: "📝" },
    { id: 2, title: "Chính sách đổi trả", icon: "🔄" },
    { id: 3, title: "Phương thức thanh toán", icon: "💳" },
    { id: 4, title: "Chính sách vận chuyển", icon: "🚚" },
    { id: 5, title: "Câu hỏi thường gặp", icon: "❓" },
  ];

  // Render nội dung tab dựa trên tab đang active
  const renderTabContent = () => {
    switch (activeTab) {
      case "notifications":
        return <NotificationsTab notifications={notifications} />;
      case "messages":
        return <MessagesTab messages={messages} />;
      case "favorites":
        return <FavoritesTab favorites={favorites} />;
      case "help":
        return <HelpTab helpTopics={helpTopics} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Tab navigation */}
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab content */}
      <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default OtherFeature;