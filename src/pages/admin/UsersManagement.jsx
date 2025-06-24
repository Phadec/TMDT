import { useState, useEffect } from "react";
import { Search, Filter, Eye, Trash2, XCircle, Plus, User } from "lucide-react";
import { adminServices } from "~/api";

function UsersManagement() {
  // CSS cho animation
  const animationStyle = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
  `;

  // Thêm style vào head
  if (typeof document !== 'undefined' && !document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = animationStyle;
    document.head.appendChild(style);
  }
  // State cho danh sách người dùng
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);
  const [userType, setUserType] = useState("users"); // "users" or "customers"
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STAFF'
  });
  const [notification, setNotification] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 10
  });

  // Function để hiển thị notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

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
      
      if (response && (response.content || response.data)) {
        // Lấy dữ liệu từ response
        const usersData = response.content || response.data || [];
        console.log('Users Response:', response);
        console.log('Users Data:', usersData);
        
        // Map backend data to frontend format - chỉ map những trường thực tế có từ API
        const mappedUsers = usersData.map(user => ({
          id: user.id,
          name: user.email, // Sử dụng email làm tên hiển thị
          email: user.email,
          role: userType === "users" 
            ? (user.role?.roleName?.toLowerCase().replace('_', '_') || "user") 
            : "customer",
          status: user.status ? user.status.toLowerCase() : "active",
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          roleObject: user.role // Keep original role object for detailed view
        }));
        
        setUsers(mappedUsers);
        setPagination(prev => ({
          ...prev,
          totalPages: response.totalPages || response.data?.totalPages || 1,
          totalElements: response.totalElements || response.data?.totalElements || usersData.length
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
    if (currentFilter === "staff") return user.role === "staff";
    if (currentFilter === "staff_management") return user.role === "staff_management";
    if (currentFilter === "staff_chat") return user.role === "staff_chat";
    if (currentFilter === "staff_news") return user.role === "staff_news";
    if (currentFilter === "customer") return user.role === "customer";
    return user.status === currentFilter;
  }).filter(user => {
    if (!searchTerm) return true;
    return user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           user.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Xử lý xem chi tiết người dùng
  const handleViewUser = async (user) => {
    try {
      setLoadingUserDetail(true);
      setShowUserDetail(true);
      let detailResponse;
      
      if (userType === "users") {
        detailResponse = await adminServices.users.getById(user.id);
      } else {
        detailResponse = await adminServices.customers.getById(user.id);
      }
      
      // Lấy dữ liệu từ response.data
      const userData = detailResponse.data || detailResponse;
      console.log('Detail Response:', detailResponse);
      console.log('User Data:', userData);
      
      // Map detailed data - chỉ những trường thực tế có từ API
      const detailedUser = {
        id: userData.id || user.id,
        name: userData.email || user.email, // Sử dụng email làm tên hiển thị
        email: userData.email || user.email,
        role: user.role, // Giữ nguyên role đã được xử lý từ mapping ban đầu
        status: userData.status ? userData.status.toLowerCase() : user.status,
        createdAt: userData.createdAt || user.createdAt,
        updatedAt: userData.updatedAt || user.updatedAt,
        // Lưu object role gốc để hiển thị thông tin chi tiết
        roleObject: (typeof userData.role === 'object' && userData.role !== null) 
          ? userData.role 
          : user.roleObject,
        // Password hash để hiển thị
        passwordHash: userData.password || "Chưa có"
      };
      
      setSelectedUser(detailedUser);
    } catch (error) {
      console.error('Error fetching user details:', error);
      // Vẫn hiển thị modal với thông tin cơ bản nếu không lấy được chi tiết
      const basicUser = {
        id: user.id,
        name: user.email,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        roleObject: user.roleObject || null,
        passwordHash: "Không thể tải thông tin"
      };
      setSelectedUser(basicUser);
      showNotification('Không thể tải đầy đủ thông tin chi tiết. Hiển thị thông tin cơ bản.', 'error');
    } finally {
      setLoadingUserDetail(false);
    }
  };





  // Xử lý đăng ký người dùng mới
  const handleRegisterUser = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
      showNotification('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      showNotification('Mật khẩu xác nhận không khớp', 'error');
      return;
    }
    
    if (registerForm.password.length < 6) {
      showNotification('Mật khẩu phải có ít nhất 6 ký tự', 'error');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.email)) {
      showNotification('Email không hợp lệ', 'error');
      return;
    }
    
    try {
      setRegisterLoading(true);
      
      const userData = {
        email: registerForm.email,
        password: registerForm.password,
        role: registerForm.role
      };      
      const response = await adminServices.auth.register(userData);
      
      console.log('Register Response:', response); // Debug response structure
      
      // Nếu đến được đây mà không có lỗi, coi như thành công
      showNotification('Đăng ký người dùng thành công!', 'success');
      
      // Reset form
      setRegisterForm({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'STAFF'
      });
      
      // Close modal
      setShowRegisterModal(false);
      
      // Refresh user list
      console.log('Refreshing user list after registration...');
      await fetchUsers();
      console.log('User list refreshed successfully');    } catch (error) {
      console.error('Error registering user:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi đăng ký người dùng';
      showNotification('Lỗi: ' + errorMessage, 'error');
    } finally {
      setRegisterLoading(false);
      
      // Fallback: Đảm bảo modal đóng sau 3 giây nếu có bất kỳ vấn đề gì
      setTimeout(() => {
        if (showRegisterModal) {
          console.log('Fallback: Forcing modal close after timeout');
          setShowRegisterModal(false);
          setRegisterForm({
            email: '',
            password: '',
            confirmPassword: '',
            role: 'STAFF'
          });
        }
      }, 3000);
    }
  };

  // Xử lý thay đổi form đăng ký
  const handleRegisterFormChange = (field, value) => {
    setRegisterForm(prev => ({
      ...prev,
      [field]: value
    }));
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
        showNotification('Đã xóa người dùng thành công', 'success');
      } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Có lỗi xảy ra khi xóa người dùng', 'error');
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
    // Xử lý trường hợp role là object
    const roleString = typeof role === 'object' && role !== null 
      ? (role.roleName?.toLowerCase() || 'staff')
      : (typeof role === 'string' ? role : 'staff');
    
    switch (roleString) {
      case "super_admin":
        return <span className="px-2 py-1 text-xs text-white bg-purple-700 rounded-full">Super Admin</span>;
      case "admin":
        return <span className="px-2 py-1 text-xs text-white bg-purple-500 rounded-full">Admin</span>;
      case "staff":
        return <span className="px-2 py-1 text-xs text-white bg-blue-500 rounded-full">Staff</span>;
      case "staff_management":
        return <span className="px-2 py-1 text-xs text-white bg-blue-600 rounded-full">Staff Mgmt</span>;
      case "staff_chat":
        return <span className="px-2 py-1 text-xs text-white bg-green-600 rounded-full">Staff Chat</span>;
      case "staff_news":
        return <span className="px-2 py-1 text-xs text-white bg-orange-600 rounded-full">Staff News</span>;
      case "customer":
        return <span className="px-2 py-1 text-xs text-white bg-green-500 rounded-full">Customer</span>;
      default:
        return <span className="px-2 py-1 text-xs text-white bg-gray-400 rounded-full">{roleString}</span>;
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
                <option value="staff">Staff</option>
                <option value="staff_management">Staff Management</option>
                <option value="staff_chat">Staff Chat</option>
                <option value="staff_news">Staff News</option>
              </>
            )}
            {userType === "customers" && (
              <>
                <option value="customer">Khách hàng</option>
              </>
            )}
          </select>
          
          {userType === "users" && (
            <button
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus size={18} />
              <span>Thêm người dùng</span>
            </button>
          )}
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
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={userType === 'users' ? 5 : 6} className="px-6 py-4 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={userType === 'users' ? 5 : 6} className="px-6 py-4 text-center text-gray-500">
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    {userType === 'users' ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">ID: {user.id}</div>
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
                  <td className="px-6 py-4 text-sm text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="p-1 text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>

                      
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

      {/* Modal đăng ký người dùng mới */}
      {showRegisterModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRegisterModal(false);
              setRegisterForm({
                email: '',
                password: '',
                confirmPassword: '',
                role: 'STAFF'
              });
            }
          }}
        >
          <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl"
               onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <User size={24} className="text-blue-600" />
                Đăng ký người dùng mới
              </h2>
              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  setRegisterForm({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    role: 'USER'
                  });
                }}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleRegisterUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => handleRegisterFormChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    registerForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Nhập email người dùng"
                  required
                />
                {registerForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email) && (
                  <p className="text-red-500 text-sm mt-1">Email không hợp lệ</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò <span className="text-red-500">*</span>
                </label>
                <select
                  value={registerForm.role}
                  onChange={(e) => handleRegisterFormChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="STAFF">Staff</option>
                  <option value="STAFF_MANAGEMENT">Staff Management</option>
                  <option value="STAFF_CHAT">Staff Chat</option>
                  <option value="STAFF_NEWS">Staff News</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => handleRegisterFormChange('password', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    registerForm.password && registerForm.password.length < 6
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  minLength={6}
                  required
                />
                {registerForm.password && registerForm.password.length < 6 && (
                  <p className="text-red-500 text-sm mt-1">Mật khẩu phải có ít nhất 6 ký tự</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => handleRegisterFormChange('confirmPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập lại mật khẩu"
                  required
                />
                {registerForm.password && registerForm.confirmPassword && 
                 registerForm.password !== registerForm.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">Mật khẩu xác nhận không khớp</p>
                )}
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterModal(false);
                    setRegisterForm({
                      email: '',
                      password: '',
                      confirmPassword: '',
                      role: 'STAFF'
                    });
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={registerLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={registerLoading || 
                           registerForm.password !== registerForm.confirmPassword ||
                           !registerForm.email || 
                           !registerForm.password || 
                           !registerForm.confirmPassword ||
                           registerForm.password.length < 6}
                >
                  {registerLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang xử lý...
                    </div>
                  ) : (
                    'Đăng ký'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết người dùng */}
      {showUserDetail && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUserDetail(false);
              setSelectedUser(null);
              setLoadingUserDetail(false);
            }
          }}
        >
          <div className="w-full max-w-4xl p-6 mx-4 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
               onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Chi tiết {userType === "users" ? "người dùng" : "khách hàng"}</h2>
              <button
                onClick={() => {
                  setShowUserDetail(false);
                  setSelectedUser(null);
                  setLoadingUserDetail(false);
                }}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            {loadingUserDetail ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-gray-600">Đang tải thông tin chi tiết...</p>
                </div>
              </div>
            ) : selectedUser && (
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-1">
                <div className="flex flex-col items-center p-6 text-center rounded-lg bg-gray-50">
                  <div className="flex items-center justify-center w-32 h-32 mb-4 text-4xl font-bold text-white bg-gray-400 rounded-full">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="mb-1 text-xl font-bold">{selectedUser.name}</h3>
                  <div className="mb-2">
                    {renderRole(selectedUser.role)}
                  </div>
                  <p className="text-gray-500">ID: {selectedUser.id}</p>
                </div>
                
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => {
                      handleDeleteUser(selectedUser.id);
                      setShowUserDetail(false);
                      setSelectedUser(null);
                    }}
                    className="flex items-center justify-center gap-1 px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                    <span>Xóa người dùng</span>
                  </button>
                </div>
              </div>
              
              <div className="md:col-span-2">
                {/* Thông tin cơ bản */}
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Thông tin cơ bản</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg bg-gray-50 md:col-span-2">
                      <p className="mb-1 text-sm font-medium text-gray-500">ID Người dùng</p>
                      <p className="text-gray-900 font-mono text-sm break-all">{selectedUser.id}</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-50 md:col-span-2">
                      <p className="mb-1 text-sm font-medium text-gray-500">Email</p>
                      <p className="text-gray-900 break-words">{selectedUser.email}</p>
                    </div>
                  </div>
                </div>

                {/* Thông tin hệ thống */}
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Thông tin hệ thống</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg bg-gray-50">
                      <p className="mb-1 text-sm font-medium text-gray-500">Vai trò</p>
                      <div className="flex items-center gap-2">
                        {renderRole(selectedUser.role)}
                        {selectedUser.roleObject && selectedUser.roleObject.description && (
                          <div className="text-xs text-gray-500">
                            ({selectedUser.roleObject.description})
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-50">
                      <p className="mb-1 text-sm font-medium text-gray-500">Trạng thái</p>
                      <div>{renderStatus(selectedUser.status)}</div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-50">
                      <p className="mb-1 text-sm font-medium text-gray-500">Ngày đăng ký</p>
                      <p className="text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-50">
                      <p className="mb-1 text-sm font-medium text-gray-500">Cập nhật lần cuối</p>
                      <p className="text-gray-900">{formatDate(selectedUser.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Thông tin bảo mật */}
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Thông tin bảo mật</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 rounded-lg bg-gray-50">
                      <p className="mb-1 text-sm font-medium text-gray-500">Mật khẩu (Hash)</p>
                      <p className="text-gray-900 font-mono text-sm break-all">{selectedUser.passwordHash}</p>
                    </div>
                  </div>
                </div>

                {/* Thông tin quyền hạn */}
                {selectedUser.roleObject && (
                  <div className="mb-6">
                    <h3 className="mb-3 text-lg font-semibold text-gray-800">Thông tin quyền hạn</h3>
                    <div className="p-4 rounded-lg bg-gray-50">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <p className="mb-1 text-sm font-medium text-gray-500">ID Vai trò</p>
                          <p className="text-gray-900 font-mono text-sm">{selectedUser.roleObject.id}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-sm font-medium text-gray-500">Tên vai trò</p>
                          <p className="text-gray-900 font-semibold">{selectedUser.roleObject.roleName}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-sm font-medium text-gray-500">Phạm vi quyền</p>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            selectedUser.roleObject.permissionScope === 'ALL' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {selectedUser.roleObject.permissionScope}
                          </span>
                        </div>
                        <div>
                          <p className="mb-1 text-sm font-medium text-gray-500">Số quyền</p>
                          <p className="text-gray-900 font-semibold">
                            {selectedUser.roleObject.permissions ? selectedUser.roleObject.permissions.length : 0}
                          </p>
                        </div>
                      </div>
                      {selectedUser.roleObject.description && (
                        <div className="mt-4">
                          <p className="mb-1 text-sm font-medium text-gray-500">Mô tả</p>
                          <p className="text-gray-900">{selectedUser.roleObject.description}</p>
                        </div>
                      )}
                      {selectedUser.roleObject.permissions && selectedUser.roleObject.permissions.length > 0 && (
                        <div className="mt-4">
                          <p className="mb-2 text-sm font-medium text-gray-500">Danh sách quyền</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedUser.roleObject.permissions.map((permission, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                              >
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}                {/* Debug Info - có thể bỏ sau */}
                {import.meta.env.DEV && (
                  <div className="mb-6">
                    <h3 className="mb-3 text-lg font-semibold text-gray-800">Debug Info</h3>
                    <div className="p-4 rounded-lg bg-gray-50">
                      <details>
                        <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                          Raw User Data (Click to expand)
                        </summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                          {JSON.stringify(selectedUser, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </div>
                )}

                {/* Hoạt động gần đây */}
                <div className="p-4 rounded-lg bg-gray-50">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Hoạt động gần đây</h3>
                  <div className="space-y-2">
                    {selectedUser.createdAt && (
                      <div className="p-3 bg-white rounded-lg border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Tạo tài khoản</p>
                            <p className="text-xs text-gray-500">{formatDate(selectedUser.createdAt)}</p>
                          </div>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                    )}
                    
                    {selectedUser.updatedAt && selectedUser.updatedAt !== selectedUser.createdAt && (
                      <div className="p-3 bg-white rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Cập nhật gần nhất</p>
                            <p className="text-xs text-gray-500">{formatDate(selectedUser.updatedAt)}</p>
                          </div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } animate-fade-in`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <div className="w-5 h-5 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                ✓
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                ✕
              </div>
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersManagement;