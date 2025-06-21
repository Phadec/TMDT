import { useState, useEffect } from "react";
import { Search, Filter, Eye, Edit, Trash2, CheckCircle, XCircle, Shield, ShieldOff, Lock, Unlock } from "lucide-react";
import { adminServices } from "~/api";

function UsersManagement() {
  // State cho danh sách người dùng
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [userType, setUserType] = useState("users"); // "users" or "customers"
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 10
  });

  // Lấy dữ liệu từ API
  useEffect(() => {
    fetchUsers();
  }, [pagination.currentPage, pagination.size, userType]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let response;
      
      if (userType === "users") {
        response = await adminServices.users.getAll(pagination.currentPage, pagination.size);
      } else {
        response = await adminServices.customers.getAll(pagination.currentPage, pagination.size);
      }
      
      if (response && response.content) {
        // Map backend data to frontend format
        const mappedUsers = response.content.map(user => ({
          id: user.id,
          name: user.fullName || user.name || `User ${user.id}`,
          email: user.email,
          phone: user.phone || "Chưa có",
          role: userType === "users" 
            ? (user.role?.roleName?.toLowerCase() || "user") 
            : "customer",
          status: user.status ? user.status.toLowerCase() : "active",
          createdAt: user.createdAt,
          lastLogin: user.lastLogin || user.updatedAt || user.updateAt || user.createdAt,
          postsCount: user.postsCount || 0,
          avatar: user.avatar || "https://via.placeholder.com/150",
          address: user.addresses && user.addresses.length > 0 
            ? (Array.isArray(user.addresses) ? user.addresses.join(", ") : user.addresses)
            : "Chưa có địa chỉ",
          bio: user.bio || "Chưa có thông tin giới thiệu",
          verified: user.verified || false,
          isSeller: user.isSeller || false,
          roleObject: user.role // Keep original role object for detailed view
        }));
        
        setUsers(mappedUsers);
        setPagination(prev => ({
          ...prev,
          totalPages: response.totalPages,
          totalElements: response.totalElements
        }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Có lỗi xảy ra khi tải dữ liệu người dùng: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Lọc người dùng theo trạng thái
  const filteredUsers = users.filter(user => {
    if (currentFilter === "all") return true;
    if (currentFilter === "super_admin") return user.role === "super_admin";
    if (currentFilter === "admin") return user.role === "admin";
    if (currentFilter === "moderator") return user.role === "moderator";
    if (currentFilter === "customer") return user.role === "customer";
    if (currentFilter === "seller") return user.isSeller;
    if (currentFilter === "verified") return user.verified;
    if (currentFilter === "unverified") return !user.verified;
    return user.status === currentFilter;
  }).filter(user => {
    if (!searchTerm) return true;
    return user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (user.phone && user.phone.includes(searchTerm));
  });

  // Xử lý xem chi tiết người dùng
  const handleViewUser = async (user) => {
    try {
      let detailResponse;
      if (userType === "users") {
        detailResponse = await adminServices.users.getById(user.id);
      } else {
        detailResponse = await adminServices.customers.getById(user.id);
      }
      
      // Map detailed data
      const detailedUser = {
        ...user,
        ...detailResponse,
        name: detailResponse.fullName || detailResponse.name || user.name,
        address: detailResponse.addresses && detailResponse.addresses.length > 0 
          ? detailResponse.addresses.join(", ") 
          : user.address
      };
      
      setSelectedUser(detailedUser);
      setShowUserDetail(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setSelectedUser(user);
      setShowUserDetail(true);
    }
  };

  // Xử lý khóa tài khoản
  const handleBanUser = async (id) => {
    try {
      if (userType === "users") {
        await adminServices.users.updateStatus(id, "BANNED");
      } else {
        await adminServices.customers.updateStatus(id, "BANNED");
      }
      
      setUsers(users.map(user => 
        user.id === id ? { ...user, status: "banned" } : user
      ));
      
      alert('Đã khóa tài khoản thành công');
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Có lỗi xảy ra khi khóa tài khoản');
    }
  };

  // Xử lý mở khóa tài khoản
  const handleUnbanUser = async (id) => {
    try {
      if (userType === "users") {
        await adminServices.users.updateStatus(id, "ACTIVE");
      } else {
        await adminServices.customers.updateStatus(id, "ACTIVE");
      }
      
      setUsers(users.map(user => 
        user.id === id ? { ...user, status: "active" } : user
      ));
      
      alert('Đã mở khóa tài khoản thành công');
    } catch (error) {
      console.error('Error unbanning user:', error);
      alert('Có lỗi xảy ra khi mở khóa tài khoản');
    }
  };

  // Xử lý đăng ký thành người bán (chỉ cho customers)
  const handleRegisterAsSeller = async (id) => {
    try {
      await adminServices.customers.registerAsSeller(id);
      setUsers(users.map(user => 
        user.id === id ? { ...user, isSeller: true } : user
      ));
      alert('Đã đăng ký thành người bán thành công');
    } catch (error) {
      console.error('Error registering as seller:', error);
      alert('Có lỗi xảy ra khi đăng ký thành người bán');
    }
  };

  // Xử lý xóa người dùng
  const handleDeleteUser = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        if (userType === "users") {
          await adminServices.users.delete(id);
        } else {
          await adminServices.customers.delete(id);
        }
        
        setUsers(users.filter(user => user.id !== id));
        alert('Đã xóa người dùng thành công');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Có lỗi xảy ra khi xóa người dùng');
      }
    }
  };

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";
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
      case "super_admin":
        return <span className="px-2 py-1 text-xs text-white bg-purple-700 rounded-full">Super Admin</span>;
      case "admin":
        return <span className="px-2 py-1 text-xs text-white bg-purple-500 rounded-full">Admin</span>;
      case "moderator":
        return <span className="px-2 py-1 text-xs text-white bg-blue-500 rounded-full">Mod</span>;
      case "user":
        return <span className="px-2 py-1 text-xs text-white bg-gray-500 rounded-full">User</span>;
      case "customer":
        return <span className="px-2 py-1 text-xs text-white bg-green-500 rounded-full">Customer</span>;
      default:
        return <span className="px-2 py-1 text-xs text-white bg-gray-400 rounded-full">{role}</span>;
    }
  };

  return (
    <div>
      {/* Thanh công cụ */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
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
          
          <select
            className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
          >
            <option value="users">Người dùng hệ thống</option>
            <option value="customers">Khách hàng</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <select
            className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={currentFilter}
            onChange={(e) => setCurrentFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="banned">Bị khóa</option>
            <option value="suspended">Tạm khóa</option>
            {userType === "users" && (
              <>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="user">User</option>
              </>
            )}
            {userType === "customers" && (
              <>
                <option value="customer">Khách hàng</option>
                <option value="seller">Người bán</option>
              </>
            )}
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
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{userType === 'users' ? 'Email' : 'Người dùng'}</th>
              {userType === 'customers' && (
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Email</th>
              )}
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
                <td colSpan={userType === 'users' ? 6 : 7} className="px-6 py-4 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={userType === 'users' ? 6 : 7} className="px-6 py-4 text-center text-gray-500">
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    {userType === 'users' ? (
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                    ) : (
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
                        {user.isSeller && (
                          <Shield size={16} className="ml-2 text-green-500" title="Người bán" />
                        )}
                      </div>
                    )}
                  </td>
                  {userType === 'customers' && (
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                  )}
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
                      
                      {userType === "customers" && !user.isSeller && (
                        <button
                          onClick={() => handleRegisterAsSeller(user.id)}
                          className="p-1 text-green-600 hover:text-green-900"
                          title="Đăng ký thành người bán"
                        >
                          <Shield size={18} />
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div className="flex justify-between flex-1 sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 0}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Trước
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages - 1}
              className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị{' '}
                <span className="font-medium">{pagination.currentPage * pagination.size + 1}</span>
                {' '}đến{' '}
                <span className="font-medium">
                  {Math.min((pagination.currentPage + 1) * pagination.size, pagination.totalElements)}
                </span>
                {' '}trong tổng số{' '}
                <span className="font-medium">{pagination.totalElements}</span>
                {' '}kết quả
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 0}
                  className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Trước
                </button>
                {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                  const pageNumber = pagination.currentPage < 3 ? index : pagination.currentPage - 2 + index;
                  if (pageNumber >= pagination.totalPages) return null;
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                        pageNumber === pagination.currentPage
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber + 1}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages - 1}
                  className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết người dùng - existing modal code with updated actions */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl p-6 mx-4 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Chi tiết {userType === "users" ? "người dùng" : "khách hàng"}</h2>
              <button
                onClick={() => setShowUserDetail(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-1">
                <div className="flex flex-col items-center p-6 text-center rounded-lg bg-gray-50">
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
                  
                  {userType === "customers" && !selectedUser.isSeller && (
                    <button
                      onClick={() => {
                        handleRegisterAsSeller(selectedUser.id);
                        setSelectedUser({...selectedUser, isSeller: true});
                      }}
                      className="flex items-center justify-center flex-1 gap-1 px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
                    >
                      <Shield size={16} />
                      <span>Đăng ký bán hàng</span>
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
                  <div className="p-4 rounded-lg bg-gray-50">
                    <p className="mb-1 text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-gray-50">
                    <p className="mb-1 text-sm font-medium text-gray-500">Số điện thoại</p>
                    <p className="text-gray-900">{selectedUser.phone}</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-gray-50">
                    <p className="mb-1 text-sm font-medium text-gray-500">Địa chỉ</p>
                    <p className="text-gray-900">{selectedUser.address}</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-gray-50">
                    <p className="mb-1 text-sm font-medium text-gray-500">Ngày đăng ký</p>
                    <p className="text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-gray-50">
                    <p className="mb-1 text-sm font-medium text-gray-500">Đăng nhập gần nhất</p>
                    <p className="text-gray-900">{formatDate(selectedUser.lastLogin)}</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-gray-50">
                    <p className="mb-1 text-sm font-medium text-gray-500">Số bài đăng</p>
                    <p className="text-gray-900">{selectedUser.postsCount}</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-gray-50">
                    <p className="mb-1 text-sm font-medium text-gray-500">Trạng thái</p>
                    <div>{renderStatus(selectedUser.status)}</div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-gray-50">
                    <p className="mb-1 text-sm font-medium text-gray-500">Vai trò</p>
                    <div className="flex items-center gap-2">
                      {renderRole(selectedUser.role)}
                      {selectedUser.roleObject && (
                        <div className="text-xs text-gray-500">
                          ({selectedUser.roleObject.description})
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 mt-4 rounded-lg bg-gray-50">
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