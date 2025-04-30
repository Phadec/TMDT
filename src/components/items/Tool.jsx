import { useState, useEffect, useRef } from "react";

function Tool() {
  const [activeSection, setActiveSection] = useState(null);
  const toolRef = useRef(null);

  const toggleSection = (section) => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
    }
  };

  // Xử lý click bên ngoài để đóng tab đang mở
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        toolRef.current &&
        !toolRef.current.contains(event.target) &&
        activeSection !== null
      ) {
        setActiveSection(null);
      }
    }

    // Thêm event listener khi component được mount
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup event listener khi component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeSection]);

  return (
    <div
      ref={toolRef}
      className="fixed right-0 top-24 z-50 flex flex-col items-end gap-3"
    >
      {/* Danh mục */}
      <div className="flex items-end">
        <button
          onClick={() => toggleSection("category")}
          className={`flex items-center rounded-l-lg lg:py-3 lg:px-4 px-1 py-1 transform transition-all duration-300 ${
            activeSection === "category"
              ? "bg-indigo-600 text-white translate-x-1 shadow-[0_10px_20px_rgba(79,70,229,0.4)]"
              : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:translate-x-1 shadow-[0_5px_15px_rgba(79,70,229,0.3)]"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
        </button>

        {activeSection === "category" && (
          <div className="bg-white rounded-l-lg p-4 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] w-72 border-l-4 border-indigo-600 transform transition-all duration-300">
            <h3 className="text-indigo-700 font-bold mb-3 text-lg">
              Danh mục sản phẩm
            </h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <Category />
            </div>
          </div>
        )}
      </div>

      {/* Nhà bán tiêu biểu */}
      <div className="flex items-end">
        <button
          onClick={() => toggleSection("seller")}
          className={`flex items-center rounded-l-lg lg:py-3 lg:px-4 px-1 py-1 transform transition-all duration-300 ${
            activeSection === "seller"
              ? "bg-teal-600 text-white translate-x-1 shadow-[0_10px_20px_rgba(13,148,136,0.4)]"
              : "bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:translate-x-1 shadow-[0_5px_15px_rgba(13,148,136,0.3)]"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </button>

        {activeSection === "seller" && (
          <div className="bg-white rounded-l-lg p-4 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] w-72 border-l-4 border-teal-600 transform transition-all duration-300">
            <h3 className="text-teal-700 font-bold mb-3 text-lg">
              Nhà bán tiêu biểu
            </h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <BestSeller />
            </div>
          </div>
        )}
      </div>

      {/* Tính năng khác */}
      <div className="flex items-end">
        <button
          onClick={() => toggleSection("features")}
          className={`flex items-center rounded-l-lg lg:py-3 lg:px-4 px-1 py-1 transform transition-all duration-300 ${
            activeSection === "features"
              ? "bg-amber-600 text-white translate-x-1 shadow-[0_10px_20px_rgba(217,119,6,0.4)]"
              : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:translate-x-1 shadow-[0_5px_15px_rgba(217,119,6,0.3)]"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
        </button>

        {activeSection === "features" && (
          <div className="bg-white rounded-l-lg p-4 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] w-72 border-l-4 border-amber-600 transform transition-all duration-300">
            <h3 className="text-amber-700 font-bold mb-3 text-lg">
              Tính năng hỗ trợ
            </h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <OtherFeature />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Category() {
  const [expandedCategories, setExpandedCategories] = useState([]);

  const toggleCategory = (categoryId) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  // Dữ liệu danh mục mẫu
  const categories = [
    {
      id: 1,
      name: "Điện tử & Công nghệ",
      icon: "💻",
      subcategories: [
        { id: 101, name: "Điện thoại & Phụ kiện" },
        { id: 102, name: "Máy tính & Laptop" },
        { id: 103, name: "Thiết bị âm thanh" },
        { id: 104, name: "Máy ảnh & Quay phim" }
      ]
    },
    {
      id: 2,
      name: "Thời trang",
      icon: "👕",
      subcategories: [
        { id: 201, name: "Thời trang nam" },
        { id: 202, name: "Thời trang nữ" },
        { id: 203, name: "Đồng hồ & Trang sức" },
        { id: 204, name: "Giày dép" }
      ]
    },
    {
      id: 3,
      name: "Nhà cửa & Đời sống",
      icon: "🏠",
      subcategories: [
        { id: 301, name: "Đồ nội thất" },
        { id: 302, name: "Đồ gia dụng" },
        { id: 303, name: "Trang trí nhà cửa" },
        { id: 304, name: "Dụng cụ nhà bếp" }
      ]
    },
    {
      id: 4,
      name: "Sức khỏe & Làm đẹp",
      icon: "💄",
      subcategories: [
        { id: 401, name: "Mỹ phẩm" },
        { id: 402, name: "Chăm sóc da" },
        { id: 403, name: "Chăm sóc tóc" },
        { id: 404, name: "Thực phẩm chức năng" }
      ]
    },
    {
      id: 5,
      name: "Thể thao & Du lịch",
      icon: "🏀",
      subcategories: [
        { id: 501, name: "Dụng cụ thể thao" },
        { id: 502, name: "Quần áo thể thao" },
        { id: 503, name: "Đồ dùng du lịch" },
        { id: 504, name: "Thiết bị dã ngoại" }
      ]
    }
  ];

  return (
    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
      {categories.map((category) => (
        <div key={category.id} className="mb-2">
          <div 
            className="flex items-center justify-between p-2 bg-white rounded-md hover:bg-indigo-50 cursor-pointer transition-colors duration-200"
            onClick={() => toggleCategory(category.id)}
          >
            <div className="flex items-center">
              <span className="mr-2 text-lg">{category.icon}</span>
              <span className="font-medium text-gray-800">{category.name}</span>
            </div>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${expandedCategories.includes(category.id) ? 'transform rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {expandedCategories.includes(category.id) && (
            <div className="ml-8 mt-1 space-y-1">
              {category.subcategories.map((subcategory) => (
                <div 
                  key={subcategory.id}
                  className="p-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-md cursor-pointer transition-colors duration-200"
                >
                  {subcategory.name}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function BestSeller() {
  // Dữ liệu mẫu cho 10 nhà bán uy tín
  const topSellers = [
    { id: 1, name: "Tech Galaxy", rating: 5, reviews: 1283, sales: 15420, avatar: "TG" },
    { id: 2, name: "Fashion Hub", rating: 5, reviews: 964, sales: 12750, avatar: "FH" },
    { id: 3, name: "Home Essentials", rating: 5, reviews: 842, sales: 10320, avatar: "HE" },
    { id: 4, name: "Beauty World", rating: 4.9, reviews: 756, sales: 9840, avatar: "BW" },
    { id: 5, name: "Sports Center", rating: 4.9, reviews: 689, sales: 8950, avatar: "SC" },
    { id: 6, name: "Gadget Pro", rating: 4.8, reviews: 621, sales: 7830, avatar: "GP" },
    { id: 7, name: "Kitchen Master", rating: 4.8, reviews: 578, sales: 7240, avatar: "KM" },
    { id: 8, name: "Toy Kingdom", rating: 4.7, reviews: 512, sales: 6580, avatar: "TK" },
    { id: 9, name: "Book Haven", rating: 4.7, reviews: 487, sales: 5920, avatar: "BH" },
    { id: 10, name: "Pet Paradise", rating: 4.6, reviews: 423, sales: 5340, avatar: "PP" }
  ];

  // Hàm tạo stars dựa trên rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    let stars = "★".repeat(fullStars);
    if (hasHalfStar) stars += "½";
    
    return stars;
  };

  return (
    <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-2">
      {topSellers.map((seller, index) => (
        <div key={seller.id} className="flex items-center p-2 rounded-md hover:bg-teal-50 transition-colors duration-200 cursor-pointer">
          <div className="relative">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-teal-600 font-bold">{seller.avatar}</span>
            </div>
            {index < 3 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-xs font-bold text-white">{index + 1}</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-800">{seller.name}</p>
              <span className="text-xs text-teal-600 font-medium">{seller.sales.toLocaleString()} đã bán</span>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-yellow-500 mr-1">{renderStars(seller.rating)}</span>
              <span className="text-xs text-gray-500">({seller.reviews.toLocaleString()})</span>
            </div>
          </div>
        </div>
      ))}
      <div className="pt-2 border-t border-gray-100">
        <button className="w-full text-center text-sm text-teal-600 hover:text-teal-700 font-medium">
          Xem tất cả nhà bán
        </button>
      </div>
    </div>
  );
}

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
    { id: 6, title: "Liên hệ hỗ trợ", icon: "📞" },
  ];

  // Render nội dung dựa trên tab đang active
  const renderTabContent = () => {
    switch (activeTab) {
      case "notifications":
        return (
          <div className="space-y-2">
            {notifications.map(notification => (
              <div key={notification.id} className={`p-2 rounded-md ${notification.isNew ? 'bg-amber-50' : 'bg-white'} hover:bg-amber-100 transition-colors duration-200 cursor-pointer`}>
                <div className="flex items-start">
                  {notification.isNew && (
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-2"></div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 font-medium">{notification.title}</p>
                    <p className="text-xs text-gray-500">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2 text-center">
              <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                Xem tất cả thông báo
              </button>
            </div>
          </div>
        );
      
      case "messages":
        return (
          <div className="space-y-2">
            {messages.map(message => (
              <div key={message.id} className={`p-2 rounded-md ${message.isNew ? 'bg-amber-50' : 'bg-white'} hover:bg-amber-100 transition-colors duration-200 cursor-pointer`}>
                <p className="text-sm text-gray-800 font-medium">{message.sender}</p>
                <p className="text-xs text-gray-600 truncate">{message.message}</p>
                <p className="text-xs text-gray-500 mt-1">{message.time}</p>
              </div>
            ))}
            <div className="pt-2 text-center">
              <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                Xem tất cả tin nhắn
              </button>
            </div>
          </div>
        );
      
      case "favorites":
        return (
          <div className="space-y-2">
            {favorites.map(item => (
              <div key={item.id} className="p-2 rounded-md bg-white hover:bg-amber-50 transition-colors duration-200 cursor-pointer">
                <p className="text-sm text-gray-800 font-medium truncate">{item.name}</p>
                <div className="flex items-center mt-1">
                  <p className="text-sm text-amber-600 font-medium">{item.price}</p>
                  <p className="text-xs text-gray-500 line-through ml-2">{item.discount}</p>
                </div>
              </div>
            ))}
            <div className="pt-2 text-center">
              <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                Xem tất cả yêu thích
              </button>
            </div>
          </div>
        );
      
      case "help":
        return (
          <div className="grid grid-cols-2 gap-2">
            {helpTopics.map(topic => (
              <div key={topic.id} className="p-2 rounded-md bg-white hover:bg-amber-50 transition-colors duration-200 cursor-pointer flex flex-col items-center justify-center">
                <span className="text-xl mb-1">{topic.icon}</span>
                <p className="text-xs text-gray-800 font-medium text-center">{topic.title}</p>
              </div>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 mb-3">
        <button
          className={`flex-1 py-2 text-xs font-medium ${activeTab === 'notifications' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-gray-500 hover:text-amber-500'}`}
          onClick={() => setActiveTab('notifications')}
        >
          Thông báo
        </button>
        <button
          className={`flex-1 py-2 text-xs font-medium ${activeTab === 'messages' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-gray-500 hover:text-amber-500'}`}
          onClick={() => setActiveTab('messages')}
        >
          Tin nhắn
        </button>
        <button
          className={`flex-1 py-2 text-xs font-medium ${activeTab === 'favorites' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-gray-500 hover:text-amber-500'}`}
          onClick={() => setActiveTab('favorites')}
        >
          Yêu thích
        </button>
        <button
          className={`flex-1 py-2 text-xs font-medium ${activeTab === 'help' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-gray-500 hover:text-amber-500'}`}
          onClick={() => setActiveTab('help')}
        >
          Trợ giúp
        </button>
      </div>

      {/* Tab content */}
      <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default Tool;
