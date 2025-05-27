import { useState, useEffect } from "react";
import { Search, Filter, Bell, Send, Trash2, Edit, Plus, X } from "lucide-react";

function NotificationsManagement() {
  // State cho danh sách thông báo
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: "",
    content: "",
    type: "info",
    target: "all"
  });

  // Giả lập việc lấy dữ liệu từ API
  useEffect(() => {
    // Trong thực tế, đây sẽ là một API call
    setTimeout(() => {
      const dummyNotifications = Array(15).fill().map((_, index) => ({
        id: index + 1,
        title: `Thông báo ${index + 1}`,
        content: `Nội dung chi tiết của thông báo ${index + 1}. Đây là thông tin quan trọng cần được gửi đến người dùng.`,
        type: ["info", "warning", "success", "error"][Math.floor(Math.random() * 4)],
        target: ["all", "user", "seller", "specific"][Math.floor(Math.random() * 4)],
        targetDetails: Math.random() > 0.7 ? "Nhóm người dùng cụ thể" : null,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        sentCount: Math.floor(Math.random() * 1000),
        readCount: Math.floor(Math.random() * 500),
        status: Math.random() > 0.3 ? "sent" : "draft"
      }));
      setNotifications(dummyNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  // Lọc thông báo theo loại
  const filteredNotifications = notifications.filter(notification => {
    if (currentFilter === "all") return true;
    if (currentFilter === "draft") return notification.status === "draft";
    if (currentFilter === "sent") return notification.status === "sent";
    return notification.type === currentFilter;
  }).filter(notification => {
    if (!searchTerm) return true;
    return notification.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
           notification.content.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Xử lý gửi thông báo
  const handleSendNotification = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, status: "sent" } : notification
    ));
  };

  // Xử lý xóa thông báo
  const handleDeleteNotification = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thông báo này?")) {
      setNotifications(notifications.filter(notification => notification.id !== id));
    }
  };

  // Xử lý tạo thông báo mới
  const handleCreateNotification = () => {
    if (!newNotification.title || !newNotification.content) {
      alert("Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo");
      return;
    }
    
    const newId = notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1;
    const notification = {
      id: newId,
      ...newNotification,
      createdAt: new Date().toISOString(),
      sentCount: 0,
      readCount: 0,
      status: "draft"
    };
    
    setNotifications([notification, ...notifications]);
    setNewNotification({
      title: "",
      content: "",
      type: "info",
      target: "all"
    });
    setShowCreateModal(false);
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Hiển thị loại thông báo
  const renderType = (type) => {
    switch (type) {
      case "info":
        return <span className="px-2 py-1 text-xs text-white bg-blue-500 rounded-full">Thông tin</span>;
      case "warning":
        return <span className="px-2 py-1 text-xs text-white bg-yellow-500 rounded-full">Cảnh báo</span>;
      case "success":
        return <span className="px-2 py-1 text-xs text-white bg-green-500 rounded-full">Thành công</span>;
      case "error":
        return <span className="px-2 py-1 text-xs text-white bg-red-500 rounded-full">Lỗi</span>;
      default:
        return null;
    }
  };

  // Hiển thị đối tượng nhận thông báo
  const renderTarget = (target, details) => {
    switch (target) {
      case "all":
        return <span className="px-2 py-1 text-xs text-white bg-purple-500 rounded-full">Tất cả</span>;
      case "user":
        return <span className="px-2 py-1 text-xs text-white bg-indigo-500 rounded-full">Người dùng</span>;
      case "seller":
        return <span className="px-2 py-1 text-xs text-white bg-pink-500 rounded-full">Người bán</span>;
      case "specific":
        return <span className="px-2 py-1 text-xs text-white bg-gray-500 rounded-full" title={details}>Nhóm cụ thể</span>;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Thanh công cụ */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Tìm kiếm thông báo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <select
            className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={currentFilter}
            onChange={(e) => setCurrentFilter(e.target.value)}
          >
            <option value="all">Tất cả thông báo</option>
            <option value="draft">Bản nháp</option>
            <option value="sent">Đã gửi</option>
            <option value="info">Thông tin</option>
            <option value="warning">Cảnh báo</option>
            <option value="success">Thành công</option>
            <option value="error">Lỗi</option>
          </select>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            <Plus size={18} className="mr-1" />
            Tạo thông báo
          </button>
        </div>
      </div>

      {/* Bảng danh sách thông báo */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Tiêu đề</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Loại</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Đối tượng</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Ngày tạo</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Đã đọc</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredNotifications.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  Không tìm thấy thông báo nào
                </td>
              </tr>
            ) : (
              filteredNotifications.map((notification) => (
                <tr key={notification.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Bell size={18} className={`mr-2 ${
                        notification.type === "info" ? "text-blue-500" :
                        notification.type === "warning" ? "text-yellow-500" :
                        notification.type === "success" ? "text-green-500" :
                        "text-red-500"
                      }`} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                        <div className="text-sm text-gray-500 truncate" style={{ maxWidth: "300px" }}>
                          {notification.content}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {renderType(notification.type)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {renderTarget(notification.target, notification.targetDetails)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(notification.createdAt)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {notification.status === "sent" ? (
                      <span className="px-2 py-1 text-xs text-white bg-green-500 rounded-full">Đã gửi</span>
                    ) : (
                      <span className="px-2 py-1 text-xs text-white bg-gray-500 rounded-full">Bản nháp</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {notification.status === "sent" ? (
                      <span>{notification.readCount}/{notification.sentCount}</span>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {notification.status === "draft" && (
                        <button
                          onClick={() => handleSendNotification(notification.id)}
                          className="p-1 text-green-600 hover:text-green-900"
                          title="Gửi thông báo"
                        >
                          <Send size={18} />
                        </button>
                      )}
                      
                      <button
                        className="p-1 text-blue-600 hover:text-blue-900"
                        title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="p-1 text-red-600 hover:text-red-900"
                        title="Xóa thông báo"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal tạo thông báo mới */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 mx-4 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Tạo thông báo mới</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Tiêu đề</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập tiêu đề thông báo"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Nội dung</label>
                <textarea
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập nội dung thông báo"
                  value={newNotification.content}
                  onChange={(e) => setNewNotification({...newNotification, content: e.target.value})}
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Loại thông báo</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newNotification.type}
                    onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                  >
                    <option value="info">Thông tin</option>
                    <option value="warning">Cảnh báo</option>
                    <option value="success">Thành công</option>
                    <option value="error">Lỗi</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Đối tượng nhận</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newNotification.target}
                    onChange={(e) => setNewNotification({...newNotification, target: e.target.value})}
                  >
                    <option value="all">Tất cả người dùng</option>
                    <option value="user">Người mua</option>
                    <option value="seller">Người bán</option>
                    <option value="specific">Nhóm cụ thể</option>
                  </select>
                </div>
              </div>
              
              {newNotification.target === "specific" && (
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Chi tiết nhóm người dùng</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Nhập chi tiết nhóm người dùng"
                    value={newNotification.targetDetails || ""}
                    onChange={(e) => setNewNotification({...newNotification, targetDetails: e.target.value})}
                  />
                </div>
              )}
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateNotification}
                  className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Tạo thông báo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsManagement;