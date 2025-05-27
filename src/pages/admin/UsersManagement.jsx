import { useState, useEffect } from "react";
import { Search, Filter, Eye, Edit, Trash2, CheckCircle, XCircle, Shield, ShieldOff, Lock, Unlock } from "lucide-react";

function UsersManagement() {
  // State cho danh sách người dùng
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);

  // Giả lập việc lấy dữ liệu từ API
  useEffect(() => {
    // Trong thực tế, đây sẽ là một API call
    setTimeout(() => {
      const dummyUsers = Array(20).fill().map((_, index) => ({
        id: index + 1,
        name: `Người dùng ${index + 1}`,
        email: `user${index + 1}@example.com`,
        phone: `09${Math.floor(Math.random() * 100000000)}`,
        role: Math.random() > 0.9 ? "admin" : (Math.random() > 0.7 ? "moderator" : "user"),
        status: Math.random() > 0.9 ? "banned" : (Math.random() > 0.8 ? "suspended" : "active"),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
        lastLogin: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        postsCount: Math.floor(Math.random() * 50),
        avatar: "https://via.placeholder.com/150",
        address: "Hồ Chí Minh, Việt Nam",
        bio: "Đây là thông tin giới thiệu ngắn về người dùng này.",
        verified: Math.random() > 0.3
      }));
      setUsers(dummyUsers);
      setLoading(false);
    }, 1000);
  }, []);

  // Lọc người dùng theo trạng thái
  const filteredUsers = users.filter(user => {
    if (currentFilter === "all") return true;
    if (currentFilter === "admin") return user.role === "admin";
    if (currentFilter === "moderator") return user.role === "moderator";
    if (currentFilter === "verified") return user.verified;
    if (currentFilter === "unverified") return !user.verified;
    return user.status === currentFilter;
  }).filter(user => {
    if (!searchTerm) return true;
    return user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.phone.includes(searchTerm);
  });

  // Xử lý xem chi tiết người dùng
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  // Xử lý khóa tài khoản
  const handleBanUser = (id) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, status: "banned" } : user
    ));
  };

  // Xử lý mở khóa tài khoản
  const handleUnbanUser = (id) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, status: "active" } : user
    ));
  };

  // Xử lý thăng cấp quyền
  const handlePromoteUser = (id) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        if (user.role === "user") return { ...user, role: "moderator" };
        if (user.role === "moderator") return { ...user, role: "admin" };
        return user;
      }
      return user;
    }));
  };

  // Xử lý hạ cấp quyền
  const handleDemoteUser = (id) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        if (user.role === "admin") return { ...user, role: "moderator" };
        if (user.role === "moderator") return { ...user, role: "user" };
        return user;
      }
      return user;
    }));
  };

  // Xử lý xóa người dùng
  const handleDeleteUser = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      setUsers(users.filter(user => user.id !== id));
    }
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

  // Hiển thị trạng thái người dùng
  const renderStatus = (status) => {
    switch (status) {
      case "active":
        return <span className="px-2 py-1 text-xs text-white bg-green-500 rounded-full">Hoạt động</span>;
      case "banned":
        return <span className="px-2 py-1 text-xs text-white bg-red-500 rounded-full">Bị khóa</span>;
      case "suspended":
        return <span className="px-2 py-1 text-xs text-white bg-yellow-500 rounded-full">Tạm khóa</span>;
      default:
        return null;
    }
  };

  // Hiển thị vai trò người dùng
  const renderRole = (role) => {
    switch (role) {
      case "admin":
        return <span className="px-2 py-1 text-xs text-white bg-purple-500 rounded-full">Admin</span>;
      case "moderator":
        return <span className="px-2 py-1 text-xs text-white bg-blue-500 rounded-full">Mod</span>;
      case "user":
        return <span className="px-2 py-1 text-xs text-white bg-gray-500 rounded-full">User</span>;
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
            placeholder="Tìm kiếm người dùng..."
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
            <option value="all">Tất cả người dùng</option>
            <option value="active">Đang hoạt động</option>
            <option value="banned">Bị khóa</option>
            <option value="suspended">Tạm khóa</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="verified">Đã xác thực</option>
            <option value="unverified">Chưa xác thực</option>
          </select>
        </div>
      </div>

      {/* Bảng danh sách người dùng */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Người dùng</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Vai trò</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Ngày đăng ký</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Bài đăng</th>
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
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10">
                        <img className="object-cover w-10 h-10 rounded-full" src={user.avatar} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      </div>
                      {user.verified && (
                        <CheckCircle size={16} className="ml-2 text-blue-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {renderRole(user.role)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {renderStatus(user.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.postsCount}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="p-1 text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                      
                      {user.status === "active" ? (
                        <button
                          onClick={() => handleBanUser(user.id)}
                          className="p-1 text-red-600 hover:text-red-900"
                          title="Khóa tài khoản"
                        >
                          <Lock size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnbanUser(user.id)}
                          className="p-1 text-green-600 hover:text-green-900"
                          title="Mở khóa tài khoản"
                        >
                          <Unlock size={18} />
                        </button>
                      )}
                      
                      {user.role !== "admin" && (
                        <button
                          onClick={() => handlePromoteUser(user.id)}
                          className="p-1 text-purple-600 hover:text-purple-900"
                          title="Thăng cấp quyền"
                        >
                          <Shield size={18} />
                        </button>
                      )}
                      
                      {user.role !== "user" && (
                        <button
                          onClick={() => handleDemoteUser(user.id)}
                          className="p-1 text-orange-600 hover:text-orange-900"
                          title="Hạ cấp quyền"
                        >
                          <ShieldOff size={18} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1 text-red-600 hover:text-red-900"
                        title="Xóa người dùng"
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

      {/* Modal xem chi tiết người dùng */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl p-6 mx-4 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Chi tiết người dùng</h2>
              <button
                onClick={() => setShowUserDetail(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-1">
                <div className="flex flex-col items-center p-6 text-center bg-gray-50 rounded-lg">
                  <img 
                    src={selectedUser.avatar} 
                    alt={selectedUser.name} 
                    className="object-cover w-32 h-32 mb-4 rounded-full"
                  />
                  <h3 className="mb-1 text-xl font-bold">{selectedUser.name}</h3>
                  <div className="mb-2">
                    {renderRole(selectedUser.role)}
                    {selectedUser.verified && (
                      <span className="inline-flex items-center px-2 py-1 ml-2 text-xs text-white bg-blue-500 rounded-full">
                        <CheckCircle size={12} className="mr-1" />
                        Đã xác thực
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500">{selectedUser.bio}</p>
                </div>
                
                <div className="flex justify-between gap-2 mt-4">
                  {selectedUser.status === "active" ? (
                    <button
                      onClick={() => {
                        handleBanUser(selectedUser.id);
                        setShowUserDetail(false);
                      }}
                      className="flex items-center justify-center flex-1 gap-1 px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
                    >
                      <Lock size={16} />
                      <span>Khóa tài khoản</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleUnbanUser(selectedUser.id);
                        setShowUserDetail(false);
                      }}
                      className="flex items-center justify-center flex-1 gap-1 px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
                    >
                      <Unlock size={16} />
                      <span>Mở khóa</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      handleDeleteUser(selectedUser.id);
                      setShowUserDetail(false);
                    }}
                    className="flex items-center justify-center flex-1 gap-1 px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="mb-1 text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="mb-1 text-sm font-medium text-gray-500">Số điện thoại</p>
                    <p className="text-gray-900">{selectedUser.phone}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="mb-1 text-sm font-medium text-gray-500">Địa chỉ</p>
                    <p className="text-gray-900">{selectedUser.address}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="mb-1 text-sm font-medium text-gray-500">Ngày đăng ký</p>
                    <p className="text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="mb-1 text-sm font-medium text-gray-500">Đăng nhập gần nhất</p>
                    <p className="text-gray-900">{formatDate(selectedUser.lastLogin)}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="mb-1 text-sm font-medium text-gray-500">Số bài đăng</p>
                    <p className="text-gray-900">{selectedUser.postsCount}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="mb-1 text-sm font-medium text-gray-500">Trạng thái</p>
                    <div>{renderStatus(selectedUser.status)}</div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="mb-1 text-sm font-medium text-gray-500">Vai trò</p>
                    <div className="flex items-center gap-2">
                      {renderRole(selectedUser.role)}
                      
                      <div className="flex gap-1 ml-2">
                        {selectedUser.role !== "admin" && (
                          <button
                            onClick={() => {
                              handlePromoteUser(selectedUser.id);
                              setSelectedUser({...selectedUser, role: selectedUser.role === "user" ? "moderator" : "admin"});
                            }}
                            className="p-1 text-purple-600 hover:text-purple-900"
                            title="Thăng cấp"
                          >
                            <Shield size={16} />
                          </button>
                        )}
                        
                        {selectedUser.role !== "user" && (
                          <button
                            onClick={() => {
                              handleDemoteUser(selectedUser.id);
                              setSelectedUser({...selectedUser, role: selectedUser.role === "admin" ? "moderator" : "user"});
                            }}
                            className="p-1 text-orange-600 hover:text-orange-900"
                            title="Hạ cấp"
                          >
                            <ShieldOff size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 mt-4 bg-gray-50 rounded-lg">
                  <h3 className="mb-2 text-lg font-medium">Hoạt động gần đây</h3>
                  <div className="space-y-2">
                    <div className="p-2 bg-white rounded">
                      <p className="text-sm">Đăng nhập vào hệ thống</p>
                      <p className="text-xs text-gray-500">{formatDate(selectedUser.lastLogin)}</p>
                    </div>
                    <div className="p-2 bg-white rounded">
                      <p className="text-sm">Đăng bài mới: "Bán điện thoại iPhone 13 Pro Max"</p>
                      <p className="text-xs text-gray-500">15/06/2023, 10:25</p>
                    </div>
                    <div className="p-2 bg-white rounded">
                      <p className="text-sm">Cập nhật thông tin cá nhân</p>
                      <p className="text-xs text-gray-500">10/06/2023, 15:40</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersManagement;