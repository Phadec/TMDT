import { useState, useEffect } from "react";
import { Search, Filter, Eye, Edit, Trash2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

function PostsManagement() {
  // State cho danh sách bài đăng
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetail, setShowPostDetail] = useState(false);

  // Giả lập việc lấy dữ liệu từ API
  useEffect(() => {
    // Trong thực tế, đây sẽ là một API call
    setTimeout(() => {
      const dummyPosts = Array(20).fill().map((_, index) => ({
        id: index + 1,
        title: `Bài đăng rao vặt ${index + 1}`,
        category: ["Điện tử", "Thời trang", "Bất động sản", "Xe cộ", "Đồ gia dụng"][Math.floor(Math.random() * 5)],
        price: Math.floor(Math.random() * 10000000) + 500000,
        author: `Người dùng ${Math.floor(Math.random() * 100) + 1}`,
        status: ["pending", "approved", "rejected"][Math.floor(Math.random() * 3)],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        views: Math.floor(Math.random() * 1000),
        reported: Math.random() > 0.8,
        description: "Mô tả chi tiết về sản phẩm này. Sản phẩm còn mới, đầy đủ phụ kiện, bảo hành chính hãng.",
        images: Array(Math.floor(Math.random() * 5) + 1).fill("https://via.placeholder.com/150"),
        location: "Hồ Chí Minh",
        contact: {
          phone: "0123456789",
          email: "user@example.com"
        }
      }));
      setPosts(dummyPosts);
      setLoading(false);
    }, 1000);
  }, []);

  // Lọc bài đăng theo trạng thái
  const filteredPosts = posts.filter(post => {
    if (currentFilter === "all") return true;
    if (currentFilter === "reported" && post.reported) return true;
    return post.status === currentFilter;
  }).filter(post => {
    if (!searchTerm) return true;
    return post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
           post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
           post.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Xử lý xem chi tiết bài đăng
  const handleViewPost = (post) => {
    setSelectedPost(post);
    setShowPostDetail(true);
  };

  // Xử lý phê duyệt bài đăng
  const handleApprovePost = (id) => {
    setPosts(posts.map(post => 
      post.id === id ? { ...post, status: "approved" } : post
    ));
  };

  // Xử lý từ chối bài đăng
  const handleRejectPost = (id) => {
    setPosts(posts.map(post => 
      post.id === id ? { ...post, status: "rejected" } : post
    ));
  };

  // Xử lý xóa bài đăng
  const handleDeletePost = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài đăng này?")) {
      setPosts(posts.filter(post => post.id !== id));
    }
  };

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
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

  // Hiển thị trạng thái bài đăng
  const renderStatus = (status) => {
    switch (status) {
      case "approved":
        return <span className="px-2 py-1 text-xs text-white bg-green-500 rounded-full">Đã duyệt</span>;
      case "rejected":
        return <span className="px-2 py-1 text-xs text-white bg-red-500 rounded-full">Từ chối</span>;
      case "pending":
        return <span className="px-2 py-1 text-xs text-white bg-yellow-500 rounded-full">Chờ duyệt</span>;
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
            placeholder="Tìm kiếm bài đăng..."
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
            <option value="all">Tất cả bài đăng</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Đã từ chối</option>
            <option value="reported">Bị báo cáo</option>
          </select>
        </div>
      </div>

      {/* Bảng danh sách bài đăng */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Bài đăng</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Danh mục</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Giá</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Người đăng</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Ngày đăng</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Trạng thái</th>
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
            ) : filteredPosts.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  Không tìm thấy bài đăng nào
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr key={post.id} className={post.reported ? "bg-red-50" : ""}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10">
                        <img className="object-cover w-10 h-10 rounded" src={post.images[0]} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{post.title}</div>
                        <div className="text-sm text-gray-500">{post.views} lượt xem</div>
                      </div>
                      {post.reported && (
                        <AlertTriangle size={16} className="ml-2 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{post.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatPrice(post.price)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{post.author}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(post.createdAt)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {renderStatus(post.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewPost(post)}
                        className="p-1 text-blue-600 hover:text-blue-900"
                      >
                        <Eye size={18} />
                      </button>
                      {post.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprovePost(post.id)}
                            className="p-1 text-green-600 hover:text-green-900"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleRejectPost(post.id)}
                            className="p-1 text-red-600 hover:text-red-900"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1 text-red-600 hover:text-red-900"
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

      {/* Modal xem chi tiết bài đăng */}
      {showPostDetail && selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl p-6 mx-4 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Chi tiết bài đăng</h2>
              <button
                onClick={() => setShowPostDetail(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <div className="mb-4">
                  <img 
                    src={selectedPost.images[0]} 
                    alt={selectedPost.title} 
                    className="object-cover w-full h-64 rounded-lg"
                  />
                </div>
                <div className="flex gap-2 mb-4 overflow-x-auto">
                  {selectedPost.images.map((img, index) => (
                    <img 
                      key={index} 
                      src={img} 
                      alt={`${selectedPost.title} ${index}`} 
                      className="object-cover w-16 h-16 rounded"
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="mb-2 text-xl font-bold">{selectedPost.title}</h3>
                <p className="mb-4 text-2xl font-bold text-indigo-600">{formatPrice(selectedPost.price)}</p>
                
                <div className="mb-4">
                  <p className="mb-1 text-sm font-medium text-gray-500">Danh mục</p>
                  <p>{selectedPost.category}</p>
                </div>
                
                <div className="mb-4">
                  <p className="mb-1 text-sm font-medium text-gray-500">Mô tả</p>
                  <p>{selectedPost.description}</p>
                </div>
                
                <div className="mb-4">
                  <p className="mb-1 text-sm font-medium text-gray-500">Địa điểm</p>
                  <p>{selectedPost.location}</p>
                </div>
                
                <div className="mb-4">
                  <p className="mb-1 text-sm font-medium text-gray-500">Liên hệ</p>
                  <p>SĐT: {selectedPost.contact.phone}</p>
                  <p>Email: {selectedPost.contact.email}</p>
                </div>
                
                <div className="mb-4">
                  <p className="mb-1 text-sm font-medium text-gray-500">Người đăng</p>
                  <p>{selectedPost.author}</p>
                </div>
                
                <div className="mb-4">
                  <p className="mb-1 text-sm font-medium text-gray-500">Ngày đăng</p>
                  <p>{formatDate(selectedPost.createdAt)}</p>
                </div>
                
                <div className="mb-4">
                  <p className="mb-1 text-sm font-medium text-gray-500">Trạng thái</p>
                  <div>{renderStatus(selectedPost.status)}</div>
                </div>
                
                {selectedPost.reported && (
                  <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle size={18} className="mr-2" />
                      <p className="font-medium">Bài đăng này đã bị báo cáo vi phạm</p>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 mt-6">
                  {selectedPost.status === "pending" && (
                    <>
                      <button
                        onClick={() => {
                          handleApprovePost(selectedPost.id);
                          setShowPostDetail(false);
                        }}
                        className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
                      >
                        Phê duyệt
                      </button>
                      <button
                        onClick={() => {
                          handleRejectPost(selectedPost.id);
                          setShowPostDetail(false);
                        }}
                        className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
                      >
                        Từ chối
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      handleDeletePost(selectedPost.id);
                      setShowPostDetail(false);
                    }}
                    className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
                  >
                    Xóa bài đăng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostsManagement;